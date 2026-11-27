import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { useApp, go } from '../lib/store.jsx';
import { computeBill, evaluateCoupon, bestCoupon } from '../lib/pricing.js';
import { COUPONS } from '../data/config.js';
import { sellPrice, productById } from '../data/products.js';
import { money } from '../lib/money.js';
import { api } from '../lib/api.js';
import { payOrder } from '../lib/onlinePayment.js';
import { QtyControl } from '../components/ProductCard.jsx';
import { ProductThumb } from '../components/ProductImage.jsx';
import { AddressList } from '../components/AddressManager.jsx';

const DAYS = [0, 1, 2].map(d => { const t = new Date(Date.now() + d * 864e5); return { v: t.toDateString(), label: d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : t.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) }; });
const SLOTS = [['8 AM – 10 AM', 8], ['10 AM – 12 PM', 10], ['12 PM – 2 PM', 12], ['4 PM – 6 PM', 16], ['6 PM – 8 PM', 18], ['8 PM – 10 PM', 20]];
const slotOk = (dayIdx, h) => !(dayIdx === 0 && h <= new Date().getHours());

export default function Checkout() {
  const { cart, orders, selectedAddress, savedCoupons, placeOrder, notify, subPref, setSubPref, catalogVersion, profile, refreshOrders, configuration } = useApp();
  const [couponInput, setCouponInput] = useState(''); const [coupon, setCoupon] = useState(null); const [couponMsg, setCouponMsg] = useState('');
  const [gift, setGift] = useState(false); const [giftMsg, setGiftMsg] = useState(''); const [giftTo, setGiftTo] = useState('');
  const [tipSel, setTipSel] = useState(0); const [customTip, setCustomTip] = useState('');
  const [mode, setMode] = useState('asap'); const [dayIdx, setDayIdx] = useState(0); const [slot, setSlot] = useState('');
  const [note, setNote] = useState('');
  const orderAttempt = useRef(null);
  const [method, setMethod] = useState('COD');
  const online = configuration.onlinePayments;
  const [quote,setQuote] = useState(null);
  const [quoteError,setQuoteError] = useState('');
  const [quoteVersion,retryQuote] = useState(0);
  const [pay, setPay] = useState({ state: 'idle', message: '' }); const [showTax, setShowTax] = useState(false);
  const tip = tipSel === -1 ? Number(customTip) || 0 : tipSel;
  const FEES=configuration.fees;
  const coupons=configuration.coupons||COUPONS;
  const estimate = useMemo(() => computeBill({ cart, coupon, gift, tip, fees:FEES }), [cart,coupon,gift,tip,catalogVersion,FEES]);
  const area = configuration.serviceAreas.find(a => a.pin === selectedAddress?.pin);
  const quoteKey=JSON.stringify([cart,selectedAddress?.id,selectedAddress?.lat,selectedAddress?.lon,selectedAddress?.pin,coupon?.code,gift,tip,quoteVersion]);
  useEffect(() => {
    setQuoteError('');
    if (!selectedAddress || !area?.serviceable || !estimate.lines.length || !Number.isInteger(tip) || tip<0 || tip>500) return;
    let active=true;
    api('/checkout/quote',{method:'POST',body:{addressId:selectedAddress.id,couponCode:coupon?.code,gift,tip}})
      .then(data=>{if(active)setQuote({key:quoteKey,data});})
      .catch(error=>{if(active)setQuoteError(error.message);});
    return ()=>{active=false;};
  },[quoteKey,area?.serviceable]);
  const confirmedQuote=quote?.key===quoteKey ? quote.data : null;
  const totals=confirmedQuote?.totals;
  const bill=totals ? {...estimate,
    lines: confirmedQuote.items.map(line=>{
      const p=productById[line.productId];
      return {p,qty:line.quantity,unit:line.unitPrice,total:line.lineTotal,mrpTotal:Math.max(line.unitPrice,p.price)*line.quantity,
        gstRate:line.taxRate,gstAmount:line.lineTotal-line.lineTotal/(1+line.taxRate/100)};
    }),
    subtotal:totals.subtotal, couponDiscount:totals.discount, delivery:totals.deliveryFee,
    handling:totals.handlingFee,smallCart:totals.smallCartFee,giftFee:totals.giftFee,tipValue:totals.tip,gstTotal:totals.taxTotal,total:totals.total
  } : estimate;
  if (totals) {
    bill.mrpTotal=bill.lines.reduce((sum,line)=>sum+line.mrpTotal,0);
    bill.productDiscount=bill.mrpTotal-bill.subtotal;
  }
  const best = bestCoupon(bill.subtotal, orders.length > 0, coupons);

  // Re-validate an applied coupon whenever the cart changes (min-order may no longer hold).
  const live = coupon ? evaluateCoupon(coupon.code, bill.subtotal, orders.length > 0, coupons) : null;
  useEffect(() => {
    if (live && !live.ok) { setCoupon(null); setCouponMsg(live.message); }
  }, [live?.ok, live?.message]);

  const apply = code => { const r = evaluateCoupon(code, bill.subtotal, orders.length > 0, coupons); if (!r.ok) { setCouponMsg(r.message); return; } setCoupon(r.coupon); setCouponInput(r.coupon.code); setCouponMsg(`${r.coupon.code} applied`); };
  const problems = [];
  if(Object.keys(cart).some(id=>!productById[id])) problems.push('Remove unavailable products from your cart.');
  if (!bill.lines.length) problems.push('Your cart is empty.');
  if (quoteError) problems.push(quoteError);
  else if (selectedAddress && area?.serviceable && !confirmedQuote) problems.push('Checking current prices and stock…');
  if (!selectedAddress) problems.push('Add a delivery address.');
  else if (!area?.serviceable) problems.push('We don’t deliver to the selected address.');
  if (mode === 'scheduled' && !slot) problems.push('Pick a delivery slot.');
  if (tipSel === -1 && (customTip === '' || Number(customTip) < 0 || Number(customTip) > 500 || !Number.isInteger(Number(customTip)))) problems.push('Enter a tip between ₹0 and ₹500.');
  if (gift && !giftTo.trim()) problems.push('Enter the gift recipient’s name.');

  const submit = async () => {
    if (problems.length || pay.state === 'processing') return;
    const details = {
      slot: mode === 'asap' ? 'As soon as possible' : `${DAYS[dayIdx].v}, ${slot}`,
      note, gift, giftMsg, giftTo, tip, paymentMethod: method, expectedTotal: bill.total, coupon: coupon?.code, substitution: subPref
    };
    const signature = JSON.stringify([selectedAddress.id, cart, details]);
    if (orderAttempt.current?.signature !== signature) {
      orderAttempt.current = { signature, key: crypto.randomUUID() };
    }
    setPay({ state: 'processing', message: '' });
    try {
      const order = await placeOrder({ ...details, key: orderAttempt.current.key });
      if (method === 'RAZORPAY') {
        go('/track/' + order.id);
        try {
          const status = await payOrder(order.id, { ...profile, phone: selectedAddress.phone || profile.phone });
          await refreshOrders();
          if (status === 'PAID') go('/confirmed/' + order.id);
          else if (status === 'PENDING') notify('Payment is being confirmed. Check the order status shortly.');
        } catch (error) { notify(error.message); }
      } else {
        go('/confirmed/' + order.id);
      }
    } catch (error) {
      if (error.status === 409) retryQuote(v=>v+1);
      setPay({ state: 'failed', message: error.message });
      notify(error.message);
    }
  };

  if (!bill.lines.length) return <section className="day3-page"><div className="empty-state"><h3>Your cart is empty</h3><p>Add items to continue to checkout.</p><button className="primary" onClick={() => go('/search?q=')}>Start shopping</button></div></section>;
  const row = (label, val, cls = '') => <div className={`bill-line ${cls}`}><span>{label}</span><b>{val}</b></div>;
  return <section className="day3-page checkout-page">
    <div className="page-topline"><button className="back-link" onClick={() => go('/')}>← Continue shopping</button></div>
    <div className="page-title"><div><h1>Checkout</h1><p>Review your basket and delivery details before placing your order.</p></div><span className="secure-pill"><ShieldCheck size={16} /> Payment options</span></div>
    <div className="checkout-layout"><div className="checkout-main">
      <section className="panel"><div className="panel-heading"><div><span className="step-number">1</span><h2>Your items <small>({bill.lines.length} products)</small></h2></div></div>
        {bill.lines.map(l => <div className="checkout-item" key={l.p.id}><div className="checkout-item-art"><ProductThumb product={l.p} /></div><div className="checkout-item-copy"><b>{l.p.name}</b><small>{l.p.brand} · {l.p.unit}</small><strong>{money(l.total)}</strong>{l.p.discount > 0 && <del>{money(l.mrpTotal)}</del>}</div><QtyControl id={l.p.id} /></div>)}
        <label className="field-label">IF AN ITEM IS UNAVAILABLE</label><select value={subPref} onChange={e => setSubPref(e.target.value)}><option value="replace">Replace with a similar item</option><option value="remove">Remove it from my order</option><option value="call">Call me first</option></select></section>
      <section className="panel"><div className="panel-heading"><div><span className="step-number">2</span><h2>Delivery address</h2></div></div><AddressList selectable />{selectedAddress && area && <p className={area.serviceable ? 'ok-note' : 'error'}>{area.serviceable ? `Deliverable${(confirmedQuote?.delivery?.etaMinutes??area.eta)!=null ? ` — about ${confirmedQuote?.delivery?.etaMinutes??area.eta} min (estimate)` : ''}` : 'Delivery unavailable.'}</p>}</section>
      <section className="panel"><div className="panel-heading"><div><span className="step-number">3</span><h2>Delivery time</h2></div></div>
        <div className="type-row"><button className={mode === 'asap' ? 'chosen' : ''} onClick={() => setMode('asap')}>ASAP</button><button className={mode === 'scheduled' ? 'chosen' : ''} onClick={() => setMode('scheduled')}>Schedule</button></div>
        {mode === 'scheduled' && <><div className="type-row">{DAYS.map((d, i) => <button key={d.v} className={dayIdx === i ? 'chosen' : ''} onClick={() => { setDayIdx(i); setSlot(''); }}>{d.label}</button>)}</div><div className="slot-grid">{SLOTS.map(([l, h]) => <button key={l} disabled={!slotOk(dayIdx, h)} className={slot === l ? 'chosen' : ''} onClick={() => setSlot(l)}>{l}{!slotOk(dayIdx, h) && <small>Unavailable</small>}</button>)}</div><small className="muted">Requested time is subject to confirmation.</small></>}
        <label className="field-label">DELIVERY / ORDER NOTE (OPTIONAL)</label><textarea rows="2" value={note} onChange={e => setNote(e.target.value)} placeholder="E.g. Call when you reach the gate" /></section>
      <section className="panel"><div className="panel-heading"><div><span className="step-number">4</span><h2>Coupons & offers</h2></div></div>
        <div className="coupon-input"><input value={couponInput} onChange={e => setCouponInput(e.target.value.toUpperCase())} placeholder="Enter coupon code" aria-label="Coupon code" /><button className="primary" onClick={() => apply(couponInput)} disabled={!couponInput.trim()}>Apply</button>{coupon && <button className="secondary" onClick={() => { setCoupon(null); setCouponInput(''); setCouponMsg('Coupon removed'); }}>Remove</button>}</div>
        {couponMsg && <p className={coupon ? 'ok-note' : 'error'}>{couponMsg}</p>}
        {best && !coupon && <p className="best-offer">💡 Best available: <b>{best.code}</b> saves about {money(best.saving)} <button className="text-link" onClick={() => apply(best.code)}>Apply</button></p>}
        <div className="chips">{[...new Set([...savedCoupons, ...coupons.map(c => c.code)])].map(c => <button className="chip" key={c} onClick={() => apply(c)}>{c}</button>)}</div>
      </section>
      <section className="panel"><div className="panel-heading"><div><span className="step-number">5</span><h2>Make it special</h2></div></div>
        <label className="option-row"><span className="option-icon">🎁</span><span className="option-copy"><b>Gift packing</b><small>Neatly packed with a gift message</small></span><span className="option-price">₹{FEES.giftPacking}</span><input type="checkbox" checked={gift} onChange={e => setGift(e.target.checked)} /></label>
        {gift && <><input className="gift-note" value={giftTo} onChange={e => setGiftTo(e.target.value)} placeholder="Recipient name" aria-label="Gift recipient" /><textarea className="gift-note" rows="2" maxLength={150} value={giftMsg} onChange={e => setGiftMsg(e.target.value)} placeholder="Gift message (optional, max 150 characters)" /></>}
        <div className="tip-area"><b>Tip your delivery partner</b><small>Optional. Included in your order total.</small><div className="tip-options">{[0, 10, 20, 30].map(v => <button key={v} className={tipSel === v ? 'chosen' : ''} onClick={() => setTipSel(v)}>{v === 0 ? 'No tip' : `₹${v}`}</button>)}<button className={tipSel === -1 ? 'chosen' : ''} onClick={() => setTipSel(-1)}>Custom</button></div>{tipSel === -1 && <input type="number" min="0" max="500" value={customTip} onChange={e => setCustomTip(e.target.value)} placeholder="Enter tip in ₹" />}</div></section>
      <section className="panel"><div className="panel-heading"><div><span className="step-number">6</span><h2>Payment method</h2></div></div>
        <div className="payment-options" role="radiogroup" aria-label="Payment method">
          <label className="payment-option"><input type="radio" name="payment" checked={method === 'COD'}
            onChange={() => setMethod('COD')} /> <span><b>Cash on Delivery</b><small>Pay when your order arrives.</small></span></label>
          {online && <label className="payment-option"><input type="radio" name="payment" checked={method === 'RAZORPAY'}
            onChange={() => setMethod('RAZORPAY')} /> <span><b>Pay online with Razorpay</b><small>UPI, debit or credit card, net banking and supported wallets.</small></span></label>}
        </div>
        {pay.state === 'failed' && <p className="error" role="alert">{pay.message}</p>}
      </section>
    </div>
    <aside className="checkout-summary panel"><span className="eyebrow">ORDER SUMMARY</span><h2>Bill details</h2>
      {row('Item total (MRP)', money(bill.mrpTotal))}{bill.productDiscount > 0 && row('Product discounts', `−${money(bill.productDiscount)}`, 'saving-line')}{row('Subtotal', money(bill.subtotal))}
      {coupon && row(`Coupon (${coupon.code})`, coupon.type === 'freedelivery' ? 'Free delivery' : `−${money(bill.couponDiscount)}`, 'saving-line')}
      {row('Delivery fee', bill.delivery ? money(bill.delivery) : 'FREE')}{row('Handling fee', money(bill.handling))}{bill.smallCart > 0 && row(`Small-cart fee (under ${money(FEES.smallCartBelow)})`, money(bill.smallCart))}
      {gift && row('Gift packing', money(bill.giftFee))}{bill.tipValue > 0 && row('Delivery partner tip', money(bill.tipValue))}
      <div className="bill-total"><span>To pay</span><strong>{money(bill.total)}</strong></div>
      <button className="text-link" onClick={() => setShowTax(!showTax)}>{showTax ? 'Hide' : 'View'} GST estimate (incl. in prices): {money(Math.round(bill.gstTotal * 100) / 100)}</button>
      {showTax && <table className="tax-table"><thead><tr><th>Item</th><th>Rate</th><th>GST</th></tr></thead><tbody>{bill.lines.map(l => <tr key={l.p.id}><td>{l.p.name} ×{l.qty}</td><td>{l.gstRate}%</td><td>{money(l.gstAmount.toFixed(2))}</td></tr>)}</tbody></table>}
      <small className="tax-note">Estimated GST is included in the displayed item prices.</small>
      {confirmedQuote?.delivery?.distanceKm!=null ? <p className="muted">Farthest fulfilment point: {confirmedQuote.delivery.distanceKm} km straight-line. Estimated preparation and travel: {confirmedQuote.delivery.etaMinutes} min. Free-delivery rules still apply.</p> : confirmedQuote && <p className="muted">Standard zone pricing applies because a fulfilment or delivery pin is unavailable.</p>}
      {confirmedQuote?.stores.length>0 && <p className="muted">Fulfilled by {confirmedQuote.stores.map(store=>store.name).join(', ')}.</p>}
      {problems.length > 0 && <ul className="problems">{problems.map(p => <li key={p}>{p}</li>)}</ul>}
      <button className="primary wide place-order" disabled={problems.length > 0 || pay.state === 'processing'} onClick={submit}>{pay.state === 'processing' ? 'Processing…' : `${method === 'RAZORPAY' ? 'Continue to payment' : 'Place order'} · ${money(bill.total)}`} {pay.state !== 'processing' && <ArrowRight size={17} />}</button>

    </aside></div></section>;
}
