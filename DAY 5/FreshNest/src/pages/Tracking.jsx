import React, { useEffect, useState } from 'react';
import { useApp, go, stageOf, canCancel, STAGE_MS } from '../lib/store.jsx';
import { ORDER_STAGES } from '../data/config.js';
import { money } from '../lib/money.js';
import { api } from '../lib/api.js';
import DeliveryMap from '../components/DeliveryMap.jsx';
import { distanceKm, travelMinutes } from '../lib/distance.js';
import { payOrder } from '../lib/onlinePayment.js';

export const useTick = (ms = 1000) => { const [, set] = useState(0); useEffect(() => { const t = setInterval(() => set(x => x + 1), ms); return () => clearInterval(t); }, []); };
const PARTNER = { name: 'Arun Kumar', rating: '4.8', trips: '1,240', phone: '+91 9XXXX 12345' };

export function OrderSummary({ order }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const downloadReceipt = async () => {
    setDownloading(true);
    setError('');
    try {
      const { downloadOrderReceipt } = await import('../lib/orderReceipt.js');
      await downloadOrderReceipt(order);
    } catch {
      setError('The receipt could not be downloaded. Try again.');
    } finally {
      setDownloading(false);
    }
  };
  return <section className="panel tracking-items"><h2>Order details</h2>
    {order.items.map((it, i) => <div className="bill-line" key={i}><span>{it.name} × {it.qty}</span><b>{money(it.price * it.qty)}</b></div>)}
    {order.bill && <>{order.bill.couponDiscount > 0 && <div className="bill-line saving-line"><span>Coupon {order.coupon}</span><b>−{money(order.bill.couponDiscount)}</b></div>}
      <div className="bill-line"><span>Delivery + handling + other fees</span><b>{money(order.bill.delivery + order.bill.handling + order.bill.smallCart + order.bill.giftFee)}</b></div>{order.tip > 0 && <div className="bill-line"><span>Tip</span><b>{money(order.tip)}</b></div>}</>}
    <div className="bill-line"><span>Payment</span><b>{order.payment} · {order.paymentStatus}</b></div>
    <div className="bill-line"><span>Delivery address</span><b className="wrap">{order.address}</b></div>
    <div className="bill-line"><span>Delivery time</span><b>{order.slot}</b></div>
    <div className="bill-total"><span>Total</span><strong>{money(order.total)}</strong></div>
    <button className="secondary" onClick={downloadReceipt} disabled={downloading}>{downloading ? 'Preparing receipt…' : 'Download order receipt'}</button>
    {error && <p className="error" role="alert">{error}</p>}
  </section>;
}

export function Confirmation({ id }) {
  const { orders } = useApp(); const o = orders.find(x => x.id === id);
  if (!o) return <section className="day3-page"><div className="empty-state"><h3>Order not found</h3><button className="primary" onClick={() => go('/')}>Home</button></div></section>;
  return <section className="day3-page"><div className="tracking-hero"><span className="tracking-icon">✅</span><span className="eyebrow">{o.demo ? 'DEMO ORDER PLACED' : 'ORDER RECEIVED'}</span><h1>Thank you! {o.demo ? 'Your demo order is confirmed.' : 'Your order has been received.'}</h1><p>Order ID <b>{o.id}</b> · {o.demo ? 'This is a demonstration order; nothing was charged or shipped.' : 'We’ll update your order status as your items are prepared.'}</p>
    <div className="row-actions center"><button className="primary" onClick={() => go(`/track/${o.id}`)}>Track order</button><button className="secondary" onClick={() => go('/')}>Continue shopping</button></div></div><OrderSummary order={o} /></section>;
}

export function Tracking({ id }) {
  useTick(); const { orders, updateOrder, notify, refreshOrders, authToken, profile } = useApp(); const o = orders.find(x => x.id === id);
  useEffect(() => { if (!authToken || !o || o.demo) return; refreshOrders().catch(e => notify(e.message)); const timer = setInterval(() => refreshOrders().catch(() => {}), 15000); return () => clearInterval(timer); }, [authToken, id, o?.demo, refreshOrders]);
  const [proof,setProof] = useState(null);
  const [confirm, setConfirm] = useState(false); const [reason, setReason] = useState(''); const [paying, setPaying] = useState(false);
  if (!o) return <section className="day3-page"><div className="empty-state"><h3>Order not found</h3><button className="primary" onClick={() => go('/account/orders')}>My orders</button></div></section>;
  const st = stageOf(o); const cancelled = st === -1; const loc=['ACCEPTED','PICKED_UP','OUT_FOR_DELIVERY'].includes(o.assignment?.status)&&!['delivered','cancelled','returned'].includes(o.status)?o.assignment.locations?.[0]:null;
  const fresh=loc && Date.now()-new Date(loc.recordedAt).getTime()<60000;
  const remaining=fresh&&o.status==='out_for_delivery'?distanceKm(loc,o.destination):null;
  const eta = Math.max(0, Math.ceil(((ORDER_STAGES.length - 1) * STAGE_MS - (Date.now() - o.createdAt)) / 1000));
  const progress = Math.min(1, (Date.now() - o.createdAt) / ((ORDER_STAGES.length - 1) * STAGE_MS));
  const cancel = async () => { if (!reason) return; if (!canCancel(o)) { notify('This order can no longer be cancelled'); setConfirm(false); return; } try { await updateOrder(o.id, { status: 'cancelled', cancelReason: reason, refund: o.payment === 'Cash on Delivery' ? 'No payment taken' : 'Payment review required' }); setConfirm(false); notify('Order cancelled and stock restored'); } catch (e) { notify(e.message); } };
  return <section className="day3-page tracking-page"><div className="page-topline"><button className="back-link" onClick={() => go('/account/orders')}>← My orders</button><span className="eyebrow">{o.demo ? 'SIMULATED TRACKING · DEMO' : 'ORDER STATUS'}</span></div>
    <div className="tracking-hero"><span className="tracking-icon">{cancelled ? '⛔' : st === 6 ? '🎉' : '🛵'}</span><span className="eyebrow">ORDER {o.id}</span><h1>{cancelled ? (o.status==='returned'?'Order returned':'Order cancelled') : ORDER_STAGES[st][0]}</h1><p>{cancelled ? (o.status==='returned'?'Return recorded.': 'Order cancelled') : !o.demo ? `Current order status: ${String(o.status).replaceAll('_', ' ')}. Status updates are managed by the store.` : st === 6 ? 'Delivered (simulated).' : `Simulated ETA: about ${Math.ceil(eta / 60) || 1} min (stages advance every ${STAGE_MS / 1000}s for demo)`}</p></div>
    {o.paymentMethod === 'RAZORPAY' && o.paymentStatus === 'PENDING' && !cancelled &&
      <section className="panel">
        <h2>Online payment pending</h2>
        <p>Complete payment before your order can be prepared. If your bank already shows a charge, check your order status before trying again.</p>
        <button className="primary" disabled={paying} onClick={async () => {
          setPaying(true);
          try {
            const status = await payOrder(o.id, profile);
            await refreshOrders();
            if (status === 'PAID') notify('Payment confirmed.');
          } catch (error) { notify(error.message); }
          finally { setPaying(false); }
        }}>{paying ? 'Opening payment…' : 'Continue to Razorpay'}</button>
      </section>}
    <div className="tracking-layout"><section className="panel"><h2>Order progress</h2><div className="tracking-steps">{ORDER_STAGES.map(([n, d], i) => <div key={n} className={`tracking-step ${!cancelled && i < st ? 'done' : ''} ${!cancelled && i === st ? 'current' : ''}`}><span className="step-dot">{!cancelled && i < st ? '✓' : i + 1}</span><div><b>{n}</b><small>{d}</small></div></div>)}</div></section>
      <div className="side-stack">
        <section className="panel"><h2>Delivery location</h2>{loc ? <><p>Last GPS update: {new Date(loc.recordedAt).toLocaleString('en-IN')}</p><p className="muted">{fresh?'Recent location report':'Location is stale — waiting for another GPS report.'}</p>{remaining!==null&&<p>About {remaining.toFixed(1)} km away · roughly {travelMinutes(remaining)} min travel (straight-line estimate, not traffic-aware).</p>}<DeliveryMap destination={o.destination} partner={loc}/></> : <p className="muted">No active partner location available.</p>}{o.deliveryEstimate?.etaMinutes!=null&&<p className="muted">Checkout estimate: {o.deliveryEstimate.etaMinutes} min. Actual arrival may vary.</p>}</section>
        <section className="panel partner-card"><h2>Delivery partner</h2>{o.assignment ? <><b>{o.assignment.partner?.name||'Assigned partner'}</b><p>{o.assignment.partner?.phone}</p><p>{o.assignment.status.replaceAll('_',' ')}</p></> : <p>No delivery partner assigned yet.</p>}</section></div></div>
    <section className="panel"><h2>Status history</h2>{o.history.map(h=><p key={h.id}>{new Date(h.createdAt).toLocaleString('en-IN')} · {h.status.replaceAll('_',' ')} · {h.note}</p>)}{o.returns.map(r=><p key={r.id}>Return: {r.status}</p>)}{o.refunds.map(r=><p key={r.id}>Refund: {money(r.amount)} · {r.status} (demo/manual record)</p>)}</section>
    {o.status==='out_for_delivery' && <section className="panel">
      <h2>Delivery confirmation</h2><p>Share this code in person when you receive your groceries.</p>
      {proof?.orderId===o.id ? <strong className="code">{proof.code}</strong> :
        <button className="secondary" onClick={async()=>{try{const data=await api('/orders/'+o.id+'/delivery-code',{method:'POST'});setProof({...data,orderId:o.id});}catch(error){notify(error.message);}}}>Show delivery code</button>}
    </section>}
    {o.sellerOrders.length>0 && <section className="panel"><h2>Store fulfilment</h2>
      {o.sellerOrders.map(row=><p key={row.id}>{row.store.name} · {row.status.toLowerCase().replaceAll('_',' ')}</p>)}
    </section>}
    <OrderSummary order={o} />
    <div className="row-actions">{!cancelled && canCancel(o) && <button className="secondary danger" onClick={() => setConfirm(true)}>Cancel order</button>}{!cancelled && !canCancel(o) && <small className="muted">Cancellation is available while an order is pending or confirmed.</small>}<button className="secondary" onClick={() => go('/support')}>Contact support</button></div>
    {confirm && <div className="overlay confirm-overlay"><div className="confirm-modal"><h2>Cancel this order?</h2><p>Choose a reason. Cancellation is available only before the order moves into processing.</p><select value={reason} onChange={e => setReason(e.target.value)}><option value="">Select a reason</option><option>Ordered by mistake</option><option>Want to change items</option><option>Delivery taking too long</option><option>Other</option></select><div className="confirm-actions"><button className="cancel-button" onClick={() => setConfirm(false)}>Keep order</button><button className="logout-confirm" disabled={!reason} onClick={cancel}>Cancel order</button></div></div></div>}
  </section>;
}
