import React, { useState } from 'react';
import { useApp, go, stageOf, canCancel } from '../lib/store.jsx';
import { COUPONS } from '../data/config.js';
import { productById, sellPrice } from '../data/products.js';
import { load, save, money } from '../lib/money.js';
import { AddressList } from '../components/AddressManager.jsx';

export const ACCOUNT_SECTIONS = [['profile', 'My profile', '👤'], ['orders', 'My orders', '📦'], ['addresses', 'Address book', '📍'], ['wishlist', 'My wishlist', '♡'], ['coupons', 'Saved coupons', '🏷️'], ['wallet', 'Wallet', '👛'], ['gst', 'GST details', '🧾'], ['support', 'Customer support', '🎧'], ['notifications', 'Notification preferences', '🔔'], ['privacy', 'Account privacy', '🔒'], ['about', 'About FreshNest', '🌿'], ['sell', 'Sell on FreshNest', '🏪'], ['cancellation', 'Cancellation & refund policy', 'ⓘ']];

export default function Account({ section = 'profile', onLogout }) {
  const { profile } = useApp();
  const pick = id => id === 'support' ? go('/support') : id === 'cancellation' ? go('/info/cancellation') : id === 'sell' ? go('/info/sell') : id === 'about' ? go('/info/about') : go(`/account/${id}`);
  const title = ACCOUNT_SECTIONS.find(s => s[0] === section)?.[1] || 'My account';
  return <section className="day3-page account-page"><div className="page-topline"><button className="back-link" onClick={() => go('/')}>← Back to shopping</button><span className="eyebrow">YOUR FRESHNEST SPACE</span></div>
    <div className="page-title"><div><h1>My account</h1><p>Manage your orders, preferences and personal details.</p></div></div>
    <div className="account-layout"><aside className="account-sidebar"><div className="account-profile"><span className="account-avatar">{(profile.name || profile.phone || 'FN').slice(0, 2).toUpperCase()}</span><div><b>{profile.name || 'Welcome back'}</b><small>{profile.phone ? `+91 ${profile.phone}` : 'Add your details'}</small></div></div>
      {ACCOUNT_SECTIONS.map(([id, name, emoji]) => <button key={id} className={section === id ? 'active' : ''} onClick={() => pick(id)}><span>{emoji}</span>{name}<span className="account-chevron">›</span></button>)}
      <button onClick={() => go('/admin')}><span>🛠️</span>Admin / seller demo<span className="account-chevron">›</span></button>
      <button onClick={onLogout}><span>↪</span>Logout<span className="account-chevron">›</span></button></aside>
      <div className="account-content"><span className="eyebrow">ACCOUNT</span><h2>{title}</h2>
        {section === 'profile' && <Profile />}{section === 'orders' && <Orders />}{section === 'addresses' && <AddressList />}{section === 'wishlist' && <Wishlist />}
        {section === 'coupons' && <Coupons />}{section === 'wallet' && <Wallet />}{section === 'gst' && <Gst />}{section === 'notifications' && <Notifs />}{section === 'privacy' && <Privacy onLogout={onLogout} />}</div></div></section>;
}

function Profile() {
  const { profile, setProfile, notify } = useApp(); const [f, setF] = useState(profile); const [err, setErr] = useState('');
  const submit = e => { e.preventDefault(); if (!f.name.trim()) return setErr('Enter your name.'); if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) return setErr('Enter a valid email address.'); if (f.phone && !/^[6-9]\d{9}$/.test(f.phone)) return setErr('Enter a valid 10-digit mobile number.'); setErr(''); setProfile(f); notify('Profile saved'); };
  return <form className="account-info" onSubmit={submit}><label className="field-label">NAME</label><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /><label className="field-label">EMAIL</label><input value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /><label className="field-label">PHONE</label><input inputMode="numeric" maxLength={10} value={f.phone} onChange={e => setF({ ...f, phone: e.target.value.replace(/\D/g, '') })} />{err && <p className="error">{err}</p>}<button className="primary" type="submit">Save changes</button></form>;
}

function Orders() {
  const { orders, reorder, notify, updateOrder } = useApp(); const [tab, setTab] = useState('current'); const [bill, setBill] = useState(null);
  const isPast = o => o.status === 'cancelled' || stageOf(o) === 6;
  const list = orders.filter(o => tab === 'past' ? isPast(o) : !isPast(o));
  return <><div className="type-row"><button className={tab === 'current' ? 'chosen' : ''} onClick={() => setTab('current')}>Current</button><button className={tab === 'past' ? 'chosen' : ''} onClick={() => setTab('past')}>Past</button></div>
    {list.length === 0 ? <div className="account-empty"><span>🛍️</span><h3>No {tab} orders</h3><button className="primary" onClick={() => go('/')}>Start shopping</button></div> : list.map(o => <article className="account-order col" key={o.id}>
      <div className="ao-top"><div><b>Order #{o.id}</b><small>{o.items.length} items · {o.date} · {o.status === 'cancelled' ? 'Cancelled' : stageOf(o) === 6 ? 'Delivered' : 'In progress'}</small></div><strong>{money(o.total)}</strong></div>
      <div className="row-actions"><button className="primary" onClick={() => go(`/track/${o.id}`)}>{isPast(o) ? 'Order details' : 'Track order'}</button><button className="secondary" onClick={() => setBill(bill === o.id ? null : o.id)}>View bill</button>
        <button className="secondary" onClick={() => { const r = reorder(o); notify(`${r.added} item(s) added to cart${r.skipped ? `, ${r.skipped} unavailable` : ''}`); }}>Reorder</button>
        {canCancel(o) && <button className="secondary danger" onClick={() => go(`/track/${o.id}`)}>Cancel…</button>}{stageOf(o) === 6 && o.status !== 'cancelled' && <button className="secondary" onClick={() => go('/support?tab=returns')}>Return / report issue</button>}</div>
      {bill === o.id && <div className="mini-bill">{o.items.map((it, i) => <div className="bill-line" key={i}><span>{it.name} × {it.qty}</span><b>{money(it.price * it.qty)}</b></div>)}<div className="bill-total"><span>Total paid/payable</span><strong>{money(o.total)}</strong></div></div>}
    </article>)}</>;
}

function Wishlist() {
  const { wish, toggleWish, changeQty, notify } = useApp(); const items = wish.map(id => productById[id]).filter(Boolean);
  if (!items.length) return <div className="account-empty"><span>♡</span><h3>Your wishlist is empty</h3><p>Save products with the heart icon.</p><button className="primary" onClick={() => go('/search?q=')}>Browse products</button></div>;
  return <>{items.map(p => <div className="account-order" key={p.id}><div><b>{p.name}</b><small>{p.brand} · {p.unit}</small><strong>{money(sellPrice(p))}</strong><small className={p.stock === 0 ? 'out' : ''}>{p.stock === 0 ? 'Out of stock' : p.stock < 12 ? `Only ${p.stock} left` : 'In stock'}</small></div>
    <div className="row-actions"><button className="primary" disabled={p.stock === 0} onClick={() => { changeQty(p.id, 1); toggleWish(p.id); notify('Moved to cart'); }}>Move to cart</button><button className="secondary" onClick={() => toggleWish(p.id)}>Remove</button></div></div>)}</>;
}

function Coupons() {
  const { savedCoupons, setSavedCoupons } = useApp(); const list = COUPONS.filter(c => savedCoupons.includes(c.code));
  return list.length ? <>{list.map(c => <div className="account-order" key={c.code}><div><b>{c.code}</b><small>{c.title}</small></div><button className="secondary" onClick={() => setSavedCoupons(s => s.filter(x => x !== c.code))}>Remove</button></div>)}</> : <div className="account-empty"><span>🏷️</span><h3>No saved coupons</h3><p>Save coupons from the offers page.</p><button className="primary" onClick={() => go('/offers')}>View offers</button></div>;
}

function Wallet() {
  const [bal, setBal] = useState(() => load('fn_wallet', 0)); const { notify } = useApp();
  return <div className="account-info"><div className="panel wallet-card"><small>FreshNest demo wallet</small><strong>{money(bal)}</strong></div><p className="muted">This wallet is a frontend demonstration. Adding money here is simulated; no real funds exist.</p><div className="row-actions">{[100, 500].map(v => <button key={v} className="secondary" onClick={() => { const n = bal + v; setBal(n); save('fn_wallet', n); notify(`Added ${money(v)} (demo)`); }}>+ {money(v)} (demo)</button>)}</div></div>;
}

function Gst() {
  const { gst, setGst, notify } = useApp(); const [f, setF] = useState(gst);
  return <div className="account-info"><label className="field-label">BUSINESS NAME</label><input value={f.business} onChange={e => setF({ ...f, business: e.target.value })} /><label className="field-label">GSTIN</label><input maxLength={15} value={f.gstin} onChange={e => setF({ ...f, gstin: e.target.value.toUpperCase() })} placeholder="15-character GSTIN" /><label className="field-label">BILLING ADDRESS</label><textarea rows={2} value={f.billing} onChange={e => setF({ ...f, billing: e.target.value })} /><p className="muted">GSTIN is saved as entered and is not verified against any government service.</p><button className="primary" onClick={() => { setGst(f); notify('GST details saved'); }}>Save GST details</button></div>;
}

function Notifs() {
  const { notif, setNotif, notify } = useApp();
  const items = [['orders', 'Order notifications', 'Status updates for your orders'], ['offers', 'Offers', 'Deals and coupons'], ['promo', 'Promotional notifications', 'Campaigns and announcements'], ['account', 'Account notifications', 'Security and account alerts']];
  return <div className="account-info">{items.map(([k, t, d]) => <label className="option-row" key={k}><span className="option-copy"><b>{t}</b><small>{d}</small></span><input type="checkbox" checked={notif[k]} onChange={e => { setNotif({ ...notif, [k]: e.target.checked }); notify('Preference saved'); }} /></label>)}<p className="muted">Preferences are stored in this browser. No notification service is connected yet.</p></div>;
}

function Privacy({ onLogout }) {
  const { notify } = useApp(); const [asked, setAsked] = useState(() => load('fn_delete_req', false));
  const clear = () => { if (!confirm('Clear all saved demo data (cart, wishlist, addresses, orders) from this browser?')) return; Object.keys(localStorage).filter(k => k.startsWith('fn_') && k !== 'fn_verified').forEach(k => localStorage.removeItem(k)); notify('Local demo data cleared'); setTimeout(() => location.reload(), 600); };
  return <div className="account-info"><p>Your demo data lives only in this browser’s localStorage. No account service is connected.</p><div className="row-actions"><button className="secondary" onClick={clear}>Clear saved demo data</button><button className="secondary" onClick={onLogout}>Logout</button></div>
    <h3>Delete account</h3>{asked ? <p className="ok-note">Deletion request recorded (demo). No real request was sent.</p> : <button className="secondary danger" onClick={() => { if (confirm('Submit a delete-account request? (demo)')) { save('fn_delete_req', true); setAsked(true); } }}>Request account deletion</button>}</div>;
}
