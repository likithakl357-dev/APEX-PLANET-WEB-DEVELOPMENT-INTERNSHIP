import React, { useState } from 'react';
import { useApp, go, stageOf } from '../lib/store.jsx';
import { products, categoryList, sellPrice } from '../data/products.js';
import { COUPONS } from '../data/config.js';
import { money, load, save } from '../lib/money.js';
import { setOverride } from '../lib/overrides.js';

const SAMPLE_ORDERS = [['FN1001', 'Asha K.', 642, 'Delivered'], ['FN1002', 'Ravi P.', 318, 'Out for delivery'], ['FN1003', 'Meera S.', 1190, 'Packed'], ['FN1004', 'John D.', 215, 'Cancelled'], ['FN1005', 'Lakshmi N.', 877, 'Delivered']];
const SALES = [['Mon', 42], ['Tue', 55], ['Wed', 38], ['Thu', 61], ['Fri', 74], ['Sat', 93], ['Sun', 80]]; // sample ₹k
const CUSTOMERS = [['Asha K.', 'asha@example.demo', 12], ['Ravi P.', 'ravi@example.demo', 7], ['Meera S.', 'meera@example.demo', 21], ['John D.', 'john@example.demo', 3]];
const RIDERS = [['Arun Kumar', 'Available'], ['Divya R.', 'On delivery'], ['Imran S.', 'Available'], ['Vijay M.', 'Off duty']];

const Stat = ({ label, value }) => <div className="panel stat"><small>{label}</small><strong>{value}</strong></div>;
const Bars = ({ data }) => { const max = Math.max(...data.map(d => d[1])); return <div className="bars" role="img" aria-label="Sales chart (sample data)">{data.map(([l, v]) => <div key={l}><span style={{ height: `${v / max * 100}%` }} title={`₹${v}k`} /><small>{l}</small></div>)}</div>; };

export default function Admin({ mode = 'admin' }) {
  const { role, setRole, orders } = useApp();
  const admin = mode === 'admin';
  const tabs = admin ? ['Overview', 'Products', 'Categories', 'Inventory', 'Orders', 'Coupons', 'Customers', 'Delivery', 'Reports'] : ['Register', 'Store', 'Listings', 'Stock', 'Orders', 'Sales'];
  const [tab, setTab] = useState(tabs[0]);
  return <section className="day3-page admin-page"><div className="page-topline"><button className="back-link" onClick={() => go('/')}>← Back to store</button><span className="eyebrow">{admin ? 'ADMIN' : 'SELLER'} DASHBOARD · DEMO</span></div>
    <div className="panel demo-banner"><b>Demo role switch.</b> This is NOT real access control — browser-only role flags are not secure. Real authorization must be enforced by the backend.
      <div className="type-row"><button className={role === 'customer' ? 'chosen' : ''} onClick={() => { setRole('customer'); go('/'); }}>Customer</button><button className={admin ? 'chosen' : ''} onClick={() => { setRole('admin'); go('/admin'); }}>Admin</button><button className={!admin ? 'chosen' : ''} onClick={() => { setRole('seller'); go('/seller'); }}>Seller</button></div></div>
    <div className="type-row wrap">{tabs.map(t => <button key={t} className={tab === t ? 'chosen' : ''} onClick={() => setTab(t)}>{t}</button>)}</div>
    {tab === 'Overview' && <><div className="stat-grid"><Stat label="Total orders (sample + demo)" value={1284 + orders.length} /><Stat label="Total products" value={products.length} /><Stat label="Customers (sample)" value={'3,420'} /><Stat label="Revenue this week (sample)" value="₹4.43 L" /></div><div className="panel"><h2>Weekly sales (sample ₹k)</h2><Bars data={SALES} /></div><OrdersTable /></>}
    {(tab === 'Products' || tab === 'Listings') && <ProductTable priceEdit stockEdit={false} />}
    {(tab === 'Inventory' || tab === 'Stock') && <ProductTable stockEdit priceEdit={false} />}
    {tab === 'Categories' && <div className="panel"><h2>Categories</h2><table className="tbl"><thead><tr><th>Category</th><th>Products</th><th>Sample GST</th></tr></thead><tbody>{categoryList.map(c => { const ps = products.filter(p => p.category === c.name); return <tr key={c.name}><td>{c.emoji} {c.name}</td><td>{ps.length}</td><td>{ps[0]?.gst}%</td></tr>; })}</tbody></table></div>}
    {tab === 'Orders' && <OrdersTable />}
    {tab === 'Coupons' && <div className="panel"><h2>Coupons</h2><table className="tbl"><thead><tr><th>Code</th><th>Rule</th><th>Min order</th></tr></thead><tbody>{COUPONS.map(c => <tr key={c.code}><td>{c.code}</td><td>{c.title}</td><td>₹{c.min}</td></tr>)}</tbody></table><small className="muted">Coupon rules live in src/data/config.js. Editing UI will need a backend.</small></div>}
    {tab === 'Customers' && <div className="panel"><h2>Customers (sample)</h2><table className="tbl"><thead><tr><th>Name</th><th>Email</th><th>Orders</th></tr></thead><tbody>{CUSTOMERS.map(c => <tr key={c[0]}><td>{c[0]}</td><td>{c[1]}</td><td>{c[2]}</td></tr>)}</tbody></table></div>}
    {tab === 'Delivery' && <div className="panel"><h2>Delivery partners (sample)</h2><table className="tbl"><tbody>{RIDERS.map(r => <tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td></tr>)}</tbody></table></div>}
    {tab === 'Reports' && <div className="panel"><h2>Sales report (sample)</h2><Bars data={SALES} /><p className="muted">All figures are sample data for layout only.</p></div>}
    {tab === 'Register' && <SellerRegister />}
    {tab === 'Store' && <SellerStore />}
    {tab === 'Sales' && <><div className="stat-grid"><Stat label="Orders this week (sample)" value="86" /><Stat label="Sales (sample)" value="₹52,300" /></div><div className="panel"><Bars data={SALES} /></div></>}
  </section>;
}

function OrdersTable() {
  const { orders } = useApp();
  const real = orders.map(o => [o.id, 'You (demo)', o.total, o.status === 'cancelled' ? 'Cancelled' : stageOf(o) === 6 ? 'Delivered' : 'In progress']);
  return <div className="panel"><h2>Orders</h2><div className="tbl-wrap"><table className="tbl"><thead><tr><th>ID</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead><tbody>{[...real, ...SAMPLE_ORDERS].map(r => <tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td><td>{money(r[2])}</td><td>{r[3]}</td></tr>)}</tbody></table></div></div>;
}

function ProductTable({ priceEdit, stockEdit }) {
  const [q, setQ] = useState(''); const [, force] = useState(0); const { notify } = useApp();
  const list = products.filter(p => `${p.name} ${p.brand}`.toLowerCase().includes(q.toLowerCase())).slice(0, 40);
  const edit = (p, key, v, min, max) => { const n = Number(v); if (!Number.isFinite(n) || n < min || n > max) return notify(`Enter a value between ${min} and ${max}`); setOverride(p, { [key]: Math.round(n) }); force(x => x + 1); notify('Updated (demo, saved in this browser)'); };
  return <div className="panel"><h2>Products</h2><input className="admin-search" placeholder="Search products (showing first 40)" value={q} onChange={e => setQ(e.target.value)} />
    <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Product</th><th>Brand</th><th>MRP ₹</th><th>Sell ₹</th><th>Stock</th></tr></thead><tbody>{list.map(p => <tr key={p.id}><td>{p.name}</td><td>{p.brand}</td>
      <td>{priceEdit ? <input type="number" defaultValue={p.price} onBlur={e => Number(e.target.value) !== p.price && edit(p, 'price', e.target.value, 1, 99999)} aria-label={`MRP for ${p.name}`} /> : p.price}</td><td>{sellPrice(p)}</td>
      <td>{stockEdit ? <input type="number" defaultValue={p.stock} onBlur={e => Number(e.target.value) !== p.stock && edit(p, 'stock', e.target.value, 0, 9999)} aria-label={`Stock for ${p.name}`} /> : p.stock}</td></tr>)}</tbody></table></div></div>;
}

function SellerRegister() {
  const [f, setF] = useState({ name: '', email: '', category: '' }); const [done, setDone] = useState(() => load('fn_seller_reg', null)); const [err, setErr] = useState('');
  const submit = e => { e.preventDefault(); if (!f.name.trim() || !/^\S+@\S+\.\S+$/.test(f.email)) return setErr('Enter a business name and valid email.'); save('fn_seller_reg', f); setDone(f); };
  if (done) return <div className="panel"><p className="ok-note">Registration recorded for “{done.name}” (demo — no review process exists yet).</p></div>;
  return <form className="panel account-info" onSubmit={submit}><label className="field-label">BUSINESS NAME</label><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /><label className="field-label">EMAIL</label><input value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /><label className="field-label">MAIN CATEGORY</label><select value={f.category} onChange={e => setF({ ...f, category: e.target.value })}><option value="">Select</option>{categoryList.map(c => <option key={c.name}>{c.name}</option>)}</select>{err && <p className="error">{err}</p>}<button className="primary" type="submit">Register (demo)</button></form>;
}
function SellerStore() {
  const [f, setF] = useState(() => load('fn_store', { name: '', address: '', hours: '' })); const { notify } = useApp();
  return <div className="panel account-info"><label className="field-label">STORE NAME</label><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /><label className="field-label">ADDRESS</label><textarea rows={2} value={f.address} onChange={e => setF({ ...f, address: e.target.value })} /><label className="field-label">OPENING HOURS</label><input value={f.hours} onChange={e => setF({ ...f, hours: e.target.value })} /><button className="primary" onClick={() => { save('fn_store', f); notify('Store info saved (demo)'); }}>Save</button></div>;
}
