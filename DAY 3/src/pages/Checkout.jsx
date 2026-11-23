import React, { useEffect, useMemo, useState } from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { useApp, go } from '../lib/store.jsx';
import { computeBill, evaluateCoupon, bestCoupon } from '../lib/pricing.js';
import { COUPONS, BANK_OFFERS, FEES, PAYMENT_METHODS, SERVICE_AREAS } from '../data/config.js';
import { sellPrice } from '../data/products.js';
import { money } from '../lib/money.js';
import { QtyControl } from '../components/ProductCard.jsx';
import { ProductThumb } from '../components/ProductImage.jsx';
import { AddressList } from '../components/AddressManager.jsx';

const DAYS = [0, 1, 2].map(d => { const t = new Date(Date.now() + d * 864e5); return { v: t.toDateString(), label: d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : t.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) }; });
const SLOTS = [['8 AM – 10 AM', 8], ['10 AM – 12 PM', 10], ['12 PM – 2 PM', 12], ['4 PM – 6 PM', 16], ['6 PM – 8 PM', 18], ['8 PM – 10 PM', 20]];
// MOCK availability: past slots are unavailable today, and 12–2 PM is "fully booked" every day.
const slotOk = (dayIdx, h) => !(dayIdx === 0 && h <= new Date().getHours()) && h !== 12;

export default function Checkout() {
  const { cart, orders, selectedAddress, savedCoupons, placeOrder, notify, subPref, setSubPref, authToken } = useApp();
  const [couponInput, setCouponInput] = useState(''); const [coupon, setCoupon] = useState(null); const [couponMsg, setCouponMsg] = useState('');
  const [gift, setGift] = useState(false); const [giftMsg, setGiftMsg] = useState(''); const [giftTo, setGiftTo] = useState('');
  const [tipSel, setTipSel] = useState(0); const [customTip, setCustomTip] = useState('');
  const [mode, setMode] = useState('asap'); const [dayIdx, setDayIdx] = useState(0); const [slot, setSlot] = useState('');
  const [note, setNote] = useState(''); const [payment, setPayment] = useState('UPI'); const [simulateFail, setSimulateFail] = useState(false);
  useEffect(() => { if (authToken) { setPayment('Cash on Delivery'); setSimulateFail(false); } }, [authToken]);
  const [pay, setPay] = useState({ state: 'idle', message: '' }); const [showTax, setShowTax] = useState(false);
  const tip = tipSel === -1 ? Number(customTip) || 0 : tipSel;
  const bill = useMemo(() => computeBill({ cart, coupon, gift, tip }), [cart, coupon, gift, tip]);
  const area = SERVICE_AREAS.find(a => a.pin === selectedAddress?.pin);
  const best = bestCoupon(bill.subtotal, orders.length > 0);

  // Re-validate an applied coupon whenever the cart changes (min-order may no longer hold).
  const live = coupon ? evaluateCoupon(coupon.code, bill.subtotal, orders.length > 0) : null;
  if (coupon && live && !live.ok) { setCoupon(null); setCouponMsg(live.message); }

  const apply = code => { const r = evaluateCoupon(code, bill.subtotal, orders.length > 0); if (!r.ok) { setCouponMsg(r.message); return; } setCoupon(r.coupon); setCouponInput(r.coupon.code); setCouponMsg(`${r.coupon.code} applied`); };
  const problems = [];
  if (!bill.lines.length) problems.push('Your cart is empty.');
  if (bill.subtotal > 0 && bill.subtotal < FEES.minOrder) problems.push(`Minimum order is ${money(FEES.minOrder)}.`);
  if (!selectedAddress) problems.push('Add a delivery address.');
  else if (!area?.serviceable) problems.push('We don’t deliver to the selected address (demo service area).');
  if (mode === 'scheduled' && !slot) problems.push('Pick a delivery slot.');
  if (tipSel === -1 && (customTip === '' || Number(customTip) < 0 || Number(customTip) > 500)) problems.push('Enter a tip between ₹0 and ₹500.');
  if (gift && !giftTo.trim()) problems.push('Enter the gift recipient’s name.');

  const submit = async () => {
    if (problems.length) return;
    const create = async () => {
      try {
      const o = await placeOrder({ items: bill.lines.map(l => ({ id: l.p.id, name: l.p.name, qty: l.qty, price: l.unit, gst: l.gstRate })), bill: { ...bill, lines: undefined },
        total: bill.total, payment, paymentStatus: payment === 'Cash on Delivery' ? 'Pay on delivery (demo)' : 'Simulated payment success', address: `${selectedAddress.type}: ${selectedAddress.text}`,
        slot: mode === 'asap' ? `ASAP (~${area.eta} min, demo)` : `${DAYS[dayIdx].label}, ${slot}`, note, gift, giftMsg, giftTo, tip, coupon: coupon?.code || null, substitution: subPref, date: new Date().toLocaleString('en-IN') });
      go(`/confirmed/${o.id}`);
      } catch (e) { setPay({ state: 'failed', message: e.message }); notify(e.message); }
    };
    if (payment === 'Cash on Delivery' || authToken) return create();
    setPay({ state: 'processing', message: '' });
    setTimeout(() => {
      if (simulateFail) setPay({ state: 'failed', message: 'Simulated payment failure. No money was charged — this is a demo.' });
      else { setPay({ state: 'idle', message: '' }); create(); }
    }, 1700);
  };

  if (!bill.lines.length) return <section className="day3-page"><div className="empty-state"><h3>Your cart is empty</h3><p>Add items to continue to checkout.</p><button className="primary" onClick={() => go('/search?q=')}>Start shopping</button></div></section>;
  const row = (label, val, cls = '') => <div className={`bill-line ${cls}`}><span>{label}</span><b>{val}</b></div>;
  return <section className="day3-page checkout-page">
    <div className="page-topline"><button className="back-link" onClick={() => go('/')}>← Continue shopping</button><span className="eyebrow">FRESHNEST CHECKOUT · {authToken ? 'DATABASE ORDER' : 'DEMO'}</span></div>
    <div className="page-title"><div><h1>Checkout</h1><p>Review your basket and delivery details before placing your order.</p></div><span className="secure-pill"><ShieldCheck size={16} /> {authToken ? 'Server-validated order · payment gateway not configured' : 'Demo checkout — no real payment'}</span></div>
    <div className="checkout-layout"><div className="checkout-main">
      <section className="panel"><div className="panel-heading"><div><span className="step-number">1</span><h2>Your items <small>({bill.lines.length} products)</small></h2></div></div>
        {bill.lines.map(l => <div className="checkout-item" key={l.p.id}><div className="checkout-item-art"><ProductThumb product={l.p} /></div><div className="checkout-item-copy"><b>{l.p.name}</b><small>{l.p.brand} · {l.p.unit}</small><strong>{money(l.total)}</strong>{l.p.discount > 0 && <del>{money(l.mrpTotal)}</del>}</div><QtyControl id={l.p.id} /></div>)}
        <label className="field-label">IF AN ITEM IS UNAVAILABLE</label><select value={subPref} onChange={e => setSubPref(e.target.value)}><option value="replace">Replace with a similar item</option><option value="remove">Remove it from my order</option><option value="call">Call me first</option></select></section>
      <section className="panel"><div className="panel-heading"><div><span className="step-number">2</span><h2>Delivery address</h2></div></div><AddressList selectable />{selectedAddress && area && <p className={area.serviceable ? 'ok-note' : 'error'}>{area.serviceable ? `Deliverable — about ${area.eta} min (demo ETA)` : 'Not serviceable (demo).'}</p>}</section>
      <section className="panel"><div className="panel-heading"><div><span className="step-number">3</span><h2>Delivery time</h2></div></div>
        <div className="type-row"><button className={mode === 'asap' ? 'chosen' : ''} onClick={() => setMode('asap')}>ASAP</button><button className={mode === 'scheduled' ? 'chosen' : ''} onClick={() => setMode('scheduled')}>Schedule</button></div>
        {mode === 'scheduled' && <><div className="type-row">{DAYS.map((d, i) => <button key={d.v} className={dayIdx === i ? 'chosen' : ''} onClick={() => { setDayIdx(i); setSlot(''); }}>{d.label}</button>)}</div><div className="slot-grid">{SLOTS.map(([l, h]) => <button key={l} disabled={!slotOk(dayIdx, h)} className={slot === l ? 'chosen' : ''} onClick={() => setSlot(l)}>{l}{!slotOk(dayIdx, h) && <small>Unavailable</small>}</button>)}</div><small className="muted">Slot availability is mock data.</small></>}
        <label className="field-label">DELIVERY / ORDER NOTE (OPTIONAL)</label><textarea rows="2" value={note} onChange={e => setNote(e.target.value)} placeholder="E.g. Call when you reach the gate" /></section>
      <section className="panel"><div className="panel-heading"><div><span className="step-number">4</span><h2>Coupons & offers</h2></div></div>
        <div className="coupon-input"><input value={couponInput} onChange={e => setCouponInput(e.target.value.toUpperCase())} placeholder="Enter coupon code" aria-label="Coupon code" /><button className="primary" onClick={() => apply(couponInput)} disabled={!couponInput.trim()}>Apply</button>{coupon && <button className="secondary" onClick={() => { setCoupon(null); setCouponInput(''); setCouponMsg('Coupon removed'); }}>Remove</button>}</div>
        {couponMsg && <p className={coupon ? 'ok-note' : 'error'}>{couponMsg}</p>}
        {best && !coupon && <p className="best-offer">💡 Best available: <b>{best.code}</b> saves about {money(best.saving)} <button className="text-link" onClick={() => apply(best.code)}>Apply</button></p>}
        <div className="chips">{[...new Set([...savedCoupons, ...COUPONS.map(c => c.code)])].map(c => <button className="chip" key={c} onClick={() => apply(c)}>{c}</button>)}</div>
        <div className="bank-offers">{BANK_OFFERS.map(b => <p key={b.id}>🏦 {b.text} <em className="muted">(demo — no cashback is credited)</em></p>)}</div></section>
      <section className="panel"><div className="panel-heading"><div><span className="step-number">5</span><h2>Make it special</h2></div></div>
        <label className="option-row"><span className="option-icon">🎁</span><span className="option-copy"><b>Gift packing</b><small>Neatly packed with a gift message</small></span><span className="option-price">₹{FEES.giftPacking}</span><input type="checkbox" checked={gift} onChange={e => setGift(e.target.checked)} /></label>
        {gift && <><input className="gift-note" value={giftTo} onChange={e => setGiftTo(e.target.value)} placeholder="Recipient name" aria-label="Gift recipient" /><textarea className="gift-note" rows="2" maxLength={150} value={giftMsg} onChange={e => setGiftMsg(e.target.value)} placeholder="Gift message (optional, max 150 characters)" /></>}
        <div className="tip-area"><b>Tip your delivery partner</b><small>100% of the tip goes to the delivery partner (demo).</small><div className="tip-options">{[0, 10, 20, 30].map(v => <button key={v} className={tipSel === v ? 'chosen' : ''} onClick={() => setTipSel(v)}>{v === 0 ? 'No tip' : `₹${v}`}</button>)}<button className={tipSel === -1 ? 'chosen' : ''} onClick={() => setTipSel(-1)}>Custom</button></div>{tipSel === -1 && <input type="number" min="0" max="500" value={customTip} onChange={e => setCustomTip(e.target.value)} placeholder="Enter tip in ₹" />}</div></section>
      <section className="panel"><div className="panel-heading"><div><span className="step-number">6</span><h2>Payment method</h2></div></div>
        <div className="payment-options">{PAYMENT_METHODS.filter(([v]) => !authToken || v === 'Cash on Delivery').map(([v, icon, desc]) => <label className={`payment-option ${payment === v ? 'selected' : ''}`} key={v}><input type="radio" name="payment" checked={payment === v} onChange={() => setPayment(v)} /><span>{icon}</span><span><b>{v}</b><small>{desc}</small></span></label>)}</div>
        <small className="tax-note">{authToken ? 'Cash on Delivery is enabled. Online UPI/card payments stay disabled until a real payment gateway is configured and verified.' : 'Demo payment only. No card, UPI or bank details are collected, and no real payment is made.'}</small>
        {!authToken && <label className="check"><input type="checkbox" checked={simulateFail} onChange={e => setSimulateFail(e.target.checked)} /> Demo: simulate a payment failure</label>}
        {pay.state === 'failed' && <div className="fail-box"><b>Payment failed</b><p>{pay.message}</p><button className="primary" onClick={submit}>Retry payment</button> <button className="secondary" onClick={() => { setPay({ state: 'idle', message: '' }); setPayment('Cash on Delivery'); }}>Switch to Cash on Delivery</button></div>}</section>
    </div>
    <aside className="checkout-summary panel"><span className="eyebrow">ORDER SUMMARY</span><h2>Bill details</h2>
      {row('Item total (MRP)', money(bill.mrpTotal))}{bill.productDiscount > 0 && row('Product discounts', `−${money(bill.productDiscount)}`, 'saving-line')}{row('Subtotal', money(bill.subtotal))}
      {coupon && row(`Coupon (${coupon.code})`, coupon.type === 'freedelivery' ? 'Free delivery' : `−${money(bill.couponDiscount)}`, 'saving-line')}
      {row('Delivery fee', bill.delivery ? money(bill.delivery) : 'FREE')}{row('Handling fee', money(bill.handling))}{bill.smallCart > 0 && row(`Small-cart fee (under ${money(FEES.smallCartBelow)})`, money(bill.smallCart))}
      {gift && row('Gift packing', money(bill.giftFee))}{bill.tipValue > 0 && row('Delivery partner tip', money(bill.tipValue))}
      <div className="bill-total"><span>To pay</span><strong>{money(bill.total)}</strong></div>
      <button className="text-link" onClick={() => setShowTax(!showTax)}>{showTax ? 'Hide' : 'View'} GST estimate (incl. in prices): {money(Math.round(bill.gstTotal * 100) / 100)}</button>
      {showTax && <table className="tax-table"><thead><tr><th>Item</th><th>Rate</th><th>GST</th></tr></thead><tbody>{bill.lines.map(l => <tr key={l.p.id}><td>{l.p.name} ×{l.qty}</td><td>{l.gstRate}%</td><td>{money(l.gstAmount.toFixed(2))}</td></tr>)}</tbody></table>}
      <small className="tax-note">GST rates are SAMPLE slabs per category for demonstration only, not a tax ruling. Prices are shown inclusive of tax.</small>
      {problems.length > 0 && <ul className="problems">{problems.map(p => <li key={p}>{p}</li>)}</ul>}
      <button className="primary wide place-order" disabled={problems.length > 0 || pay.state === 'processing'} onClick={submit}>{pay.state === 'processing' ? 'Processing…' : payment === 'Cash on Delivery' ? `Place order · ${money(bill.total)}` : `Pay ${money(bill.total)} (simulated)`} {pay.state !== 'processing' && <ArrowRight size={17} />}</button>
      <small className="checkout-note">{authToken ? 'Order totals, coupon, address and stock are revalidated by the backend. Cash on Delivery only.' : 'Demo only — no real payment will be collected and no real order is created.'}</small>
    </aside></div></section>;
}
