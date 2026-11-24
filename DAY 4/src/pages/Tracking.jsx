import React, { useEffect, useState } from 'react';
import { useApp, go, stageOf, canCancel, STAGE_MS } from '../lib/store.jsx';
import { ORDER_STAGES } from '../data/config.js';
import { money } from '../lib/money.js';

export const useTick = (ms = 1000) => { const [, set] = useState(0); useEffect(() => { const t = setInterval(() => set(x => x + 1), ms); return () => clearInterval(t); }, []); };
const PARTNER = { name: 'Arun Kumar', rating: '4.8', trips: '1,240', phone: '+91 9XXXX 12345' };

export function OrderSummary({ order }) {
  return <section className="panel tracking-items"><h2>Order details</h2>
    {order.items.map((it, i) => <div className="bill-line" key={i}><span>{it.name} × {it.qty}</span><b>{money(it.price * it.qty)}</b></div>)}
    {order.bill && <>{order.bill.couponDiscount > 0 && <div className="bill-line saving-line"><span>Coupon {order.coupon}</span><b>−{money(order.bill.couponDiscount)}</b></div>}
      <div className="bill-line"><span>Delivery + handling + other fees</span><b>{money(order.bill.delivery + order.bill.handling + order.bill.smallCart + order.bill.giftFee)}</b></div>{order.tip > 0 && <div className="bill-line"><span>Tip</span><b>{money(order.tip)}</b></div>}</>}
    <div className="bill-line"><span>Payment</span><b>{order.payment} · {order.paymentStatus}</b></div>
    <div className="bill-line"><span>Delivery address</span><b className="wrap">{order.address}</b></div>
    <div className="bill-line"><span>Delivery time</span><b>{order.slot}</b></div>
    <div className="bill-total"><span>Total</span><strong>{money(order.total)}</strong></div></section>;
}

export function Confirmation({ id }) {
  const { orders } = useApp(); const o = orders.find(x => x.id === id);
  if (!o) return <section className="day3-page"><div className="empty-state"><h3>Order not found</h3><button className="primary" onClick={() => go('/')}>Home</button></div></section>;
  return <section className="day3-page"><div className="tracking-hero"><span className="tracking-icon">✅</span><span className="eyebrow">{o.demo ? 'DEMO ORDER PLACED' : 'ORDER RECEIVED'}</span><h1>Thank you! {o.demo ? 'Your demo order is confirmed.' : 'Your order has been received.'}</h1><p>Order ID <b>{o.id}</b> · {o.demo ? 'This is a demonstration order; nothing was charged or shipped.' : 'We’ll update your order status as your items are prepared.'}</p>
    <div className="row-actions center"><button className="primary" onClick={() => go(`/track/${o.id}`)}>Track order</button><button className="secondary" onClick={() => go('/')}>Continue shopping</button></div></div><OrderSummary order={o} /></section>;
}

export function Tracking({ id }) {
  useTick(); const { orders, updateOrder, notify, refreshOrders, authToken } = useApp(); const o = orders.find(x => x.id === id);
  useEffect(() => { if (!authToken || !o || o.demo) return; refreshOrders().catch(e => notify(e.message)); const timer = setInterval(() => refreshOrders().catch(() => {}), 15000); return () => clearInterval(timer); }, [authToken, id, o?.demo, refreshOrders]);
  const [confirm, setConfirm] = useState(false); const [reason, setReason] = useState('');
  if (!o) return <section className="day3-page"><div className="empty-state"><h3>Order not found</h3><button className="primary" onClick={() => go('/account/orders')}>My orders</button></div></section>;
  const st = stageOf(o); const cancelled = st === -1; const loc=o.assignment?.locations?.[0];
  const eta = Math.max(0, Math.ceil(((ORDER_STAGES.length - 1) * STAGE_MS - (Date.now() - o.createdAt)) / 1000));
  const progress = Math.min(1, (Date.now() - o.createdAt) / ((ORDER_STAGES.length - 1) * STAGE_MS));
  const cancel = async () => { if (!reason) return; if (!canCancel(o)) { notify('This order can no longer be cancelled'); setConfirm(false); return; } try { await updateOrder(o.id, { status: 'cancelled', cancelReason: reason, refund: o.payment === 'Cash on Delivery' ? 'No payment taken' : 'Payment review required' }); setConfirm(false); notify('Order cancelled and stock restored'); } catch (e) { notify(e.message); } };
  return <section className="day3-page tracking-page"><div className="page-topline"><button className="back-link" onClick={() => go('/account/orders')}>← My orders</button><span className="eyebrow">{o.demo ? 'SIMULATED TRACKING · DEMO' : 'ORDER STATUS'}</span></div>
    <div className="tracking-hero"><span className="tracking-icon">{cancelled ? '⛔' : st === 6 ? '🎉' : '🛵'}</span><span className="eyebrow">ORDER {o.id}</span><h1>{cancelled ? (o.status==='returned'?'Order returned':'Order cancelled') : ORDER_STAGES[st][0]}</h1><p>{cancelled ? (o.status==='returned'?'Return recorded.': 'Order cancelled') : !o.demo ? `Current order status: ${String(o.status).replaceAll('_', ' ')}. Status updates are managed by the store.` : st === 6 ? 'Delivered (simulated).' : `Simulated ETA: about ${Math.ceil(eta / 60) || 1} min (stages advance every ${STAGE_MS / 1000}s for demo)`}</p></div>
    <div className="tracking-layout"><section className="panel"><h2>Order progress</h2><div className="tracking-steps">{ORDER_STAGES.map(([n, d], i) => <div key={n} className={`tracking-step ${!cancelled && i < st ? 'done' : ''} ${!cancelled && i === st ? 'current' : ''}`}><span className="step-dot">{!cancelled && i < st ? '✓' : i + 1}</span><div><b>{n}</b><small>{d}</small></div></div>)}</div></section>
      <div className="side-stack">
        <section className="panel"><h2>Delivery location</h2>{loc ? <><p>Last GPS update: {new Date(loc.recordedAt).toLocaleString('en-IN')}</p><p>{loc.latitude.toFixed(5)}, {loc.longitude.toFixed(5)}</p><a href={`https://www.openstreetmap.org/?mlat=${loc.latitude}&mlon=${loc.longitude}#map=16/${loc.latitude}/${loc.longitude}`} target="_blank" rel="noreferrer">View reported location</a></> : <p className="muted">No partner location reported yet.</p>}</section>
        <section className="panel partner-card"><h2>Delivery partner</h2>{o.assignment ? <><b>{o.assignment.partner?.name||'Assigned partner'}</b><p>{o.assignment.partner?.phone}</p><p>{o.assignment.status.replaceAll('_',' ')}</p></> : <p>No delivery partner assigned yet.</p>}</section></div></div>
    <section className="panel"><h2>Status history</h2>{o.history.map(h=><p key={h.id}>{new Date(h.createdAt).toLocaleString('en-IN')} · {h.status.replaceAll('_',' ')} · {h.note}</p>)}{o.returns.map(r=><p key={r.id}>Return: {r.status}</p>)}{o.refunds.map(r=><p key={r.id}>Refund: {money(r.amount)} · {r.status} (demo/manual record)</p>)}</section>
    <OrderSummary order={o} />
    <div className="row-actions">{!cancelled && canCancel(o) && <button className="secondary danger" onClick={() => setConfirm(true)}>Cancel order</button>}{!cancelled && !canCancel(o) && <small className="muted">Cancellation isn’t available once packing has started (sample policy).</small>}<button className="secondary" onClick={() => go('/support')}>Contact support</button></div>
    {confirm && <div className="overlay confirm-overlay"><div className="confirm-modal"><h2>Cancel this order?</h2><p>Choose a reason. Cancellation is available only before the order moves into processing.</p><select value={reason} onChange={e => setReason(e.target.value)}><option value="">Select a reason</option><option>Ordered by mistake</option><option>Want to change items</option><option>Delivery taking too long</option><option>Other</option></select><div className="confirm-actions"><button className="cancel-button" onClick={() => setConfirm(false)}>Keep order</button><button className="logout-confirm" disabled={!reason} onClick={cancel}>Cancel order</button></div></div></div>}
  </section>;
}
