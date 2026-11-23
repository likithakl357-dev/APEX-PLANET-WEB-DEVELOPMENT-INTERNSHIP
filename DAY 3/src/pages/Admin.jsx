import React, { useEffect, useState } from 'react';
import { useApp, go } from '../lib/store.jsx';
import { products, categoryList, sellPrice } from '../data/products.js';
import { COUPONS } from '../data/config.js';
import { money } from '../lib/money.js';
import { api } from '../lib/api.js';


const Stat = ({ label, value }) => <div className="panel stat"><small>{label}</small><strong>{value}</strong></div>;
const Bars = ({ data }) => { const max = Math.max(...data.map(d => d[1])); return <div className="bars" role="img" aria-label="Sales chart (sample data)">{data.map(([l, v]) => <div key={l}><span style={{ height: `${v / max * 100}%` }} title={`₹${v}k`} /><small>{l}</small></div>)}</div>; };

export default function Admin({ mode = 'admin' }) {
  const { authUser, authToken, notify } = useApp();
  const [overview, setOverview] = useState(null);
  const [serverOrders, setServerOrders] = useState([]);
  const [loadError, setLoadError] = useState('');
  const admin = mode === 'admin';
  const allowed = admin ? authUser?.role === 'ADMIN' : authUser?.role === 'SELLER';
  const tabs = admin ? ['Overview', 'Products', 'Categories', 'Inventory', 'Orders'] : ['Overview', 'Listings', 'Stock', 'Orders'];
  const [tab, setTab] = useState(tabs[0]);
  useEffect(() => {
    if (!authToken || !allowed || !admin) return;
    Promise.all([api('/admin/overview'), api('/admin/orders')])
      .then(([stats, rows]) => { setOverview(stats); setServerOrders(rows); })
      .catch(e => setLoadError(e.message));
  }, [authToken, allowed, admin]);
  if (!authToken || !allowed) return <section className="day3-page admin-page"><div className="empty-state"><h2>Restricted dashboard</h2><p>This page requires a verified {admin ? 'ADMIN' : 'SELLER'} account. Browser-only role switching has been removed.</p><button className="primary" onClick={() => go('/')}>Back to store</button></div></section>;
  if (!admin) return <section className="day3-page admin-page"><div className="empty-state"><h2>Seller workspace</h2><p>Seller onboarding, listings and settlements require additional server workflows. This account is authenticated, but seller operations are not enabled in this release.</p></div></section>;
  const refreshOrders = () => api('/admin/orders').then(setServerOrders).catch(e => notify(e.message));
  return <section className="day3-page admin-page"><div className="page-topline"><button className="back-link" onClick={() => go('/')}>← Back to store</button><span className="eyebrow">ADMIN DASHBOARD · POSTGRESQL</span></div>
    <div className="panel demo-banner"><b>Secure administrator session.</b> All displayed order, inventory and sales metrics are retrieved from the backend. {loadError && <p className="error">{loadError}</p>}</div>
    <div className="type-row wrap">{tabs.map(t => <button key={t} className={tab === t ? 'chosen' : ''} onClick={() => setTab(t)}>{t}</button>)}</div>
    {tab === 'Overview' && <><div className="stat-grid"><Stat label="Database orders" value={overview?.orders ?? '…'} /><Stat label="Database products" value={overview?.products ?? products.length} /><Stat label="Registered users" value={overview?.customers ?? '…'} /><Stat label="Paid revenue" value={overview ? money(overview.paidRevenue) : '…'} /></div><div className="panel"><h2>Inventory alerts</h2><p>{overview ? `${overview.lowStock} products are at or below the low-stock threshold.` : 'Loading database metrics…'}</p></div><OrdersTable rows={serverOrders} onRefresh={refreshOrders} /></>}
    {tab === 'Products' && <ProductTable priceEdit stockEdit={false} />}
    {tab === 'Inventory' && <ProductTable stockEdit priceEdit={false} />}
    {tab === 'Categories' && <div className="panel"><h2>Categories</h2><table className="tbl"><thead><tr><th>Category</th><th>Products</th><th>GST sample</th></tr></thead><tbody>{categoryList.map(c => { const ps = products.filter(p => p.category === c.name); return <tr key={c.name}><td>{c.emoji} {c.name}</td><td>{ps.length}</td><td>{ps[0]?.gst}%</td></tr>; })}</tbody></table></div>}
    {tab === 'Orders' && <OrdersTable rows={serverOrders} onRefresh={refreshOrders} />}
  </section>;
}

function OrdersTable({ rows = [], onRefresh }) {
  const { notify } = useApp();
  const update = async (id, status) => { try { await api(`/admin/orders/${id}/status`, { method: 'PATCH', body: { status } }); notify('Order status updated'); onRefresh?.(); } catch (e) { notify(e.message); } };
  return <div className="panel"><h2>Orders from PostgreSQL</h2><div className="tbl-wrap"><table className="tbl"><thead><tr><th>Order</th><th>Customer</th><th>Amount</th><th>Status</th><th>Update</th></tr></thead><tbody>{rows.map(o => <tr key={o.id}><td>{o.orderNumber}</td><td>{o.user?.name || o.user?.phone}</td><td>{money(o.total)}</td><td>{o.status}</td><td><select value={o.status} onChange={e => update(o.id, e.target.value)}><option value="PENDING">Pending</option><option value="CONFIRMED">Confirmed</option><option value="PROCESSING">Processing</option><option value="PACKED">Packed</option><option value="OUT_FOR_DELIVERY">Out for delivery</option><option value="DELIVERED">Delivered</option><option value="CANCELLED">Cancelled</option></select></td></tr>)}{!rows.length && <tr><td colSpan="5">No database orders yet.</td></tr>}</tbody></table></div></div>;
}

function ProductTable({ priceEdit, stockEdit }) {
  const [q, setQ] = useState(''); const [, force] = useState(0); const { notify } = useApp();
  const list = products.filter(p => `${p.name} ${p.brand}`.toLowerCase().includes(q.toLowerCase())).slice(0, 40);
  const edit = async (p, key, v, min, max) => { const n = Number(v); if (!Number.isFinite(n) || n < min || n > max) return notify(`Enter a value between ${min} and ${max}`); try { if (stockEdit) await api(`/admin/products/${p.id}/inventory`, { method: 'PATCH', body: { quantity: Math.round(n) } }); else await api(`/admin/products/${p.id}`, { method: 'PATCH', body: { [key]: Math.round(n) } }); p[key] = Math.round(n); force(x => x + 1); notify('Database updated'); } catch (e) { notify(e.message); } };
  return <div className="panel"><h2>Products</h2><input className="admin-search" placeholder="Search products (showing first 40)" value={q} onChange={e => setQ(e.target.value)} />
    <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Product</th><th>Brand</th><th>MRP ₹</th><th>Sell ₹</th><th>Stock</th></tr></thead><tbody>{list.map(p => <tr key={p.id}><td>{p.name}</td><td>{p.brand}</td>
      <td>{priceEdit ? <input type="number" defaultValue={p.price} onBlur={e => Number(e.target.value) !== p.price && edit(p, 'price', e.target.value, 1, 99999)} aria-label={`MRP for ${p.name}`} /> : p.price}</td><td>{sellPrice(p)}</td>
      <td>{stockEdit ? <input type="number" defaultValue={p.stock} onBlur={e => Number(e.target.value) !== p.stock && edit(p, 'stock', e.target.value, 0, 9999)} aria-label={`Stock for ${p.name}`} /> : p.stock}</td></tr>)}</tbody></table></div></div>;
}

