import { api } from '../lib/api.js';
import React, { useState } from 'react';
import { useApp, go, stageOf, canCancel } from '../lib/store.jsx';
import { COUPONS } from '../data/config.js';
import { productById, sellPrice } from '../data/products.js';
import { load, save, money } from '../lib/money.js';
import { AddressList } from '../components/AddressManager.jsx';

export const ACCOUNT_SECTIONS = [['profile', 'My profile', '👤'], ['orders', 'My orders', '📦'], ['addresses', 'Address book', '📍'], ['wishlist', 'My wishlist', '♡'], ['coupons', 'Saved coupons', '🏷️'], ['gst', 'GST details', '🧾'], ['support', 'Customer support', '🎧'], ['privacy', 'Account privacy', '🔒'], ['about', 'About FreshNest', '🌿'], ['sell', 'Sell on FreshNest', '🏪'], ['cancellation', 'Cancellation & refund policy', 'ⓘ']];

export default function Account({ section = 'profile', onLogout }) {
  const { profile, authUser } = useApp();
  const pick = id => id === 'support' ? go('/support') : id === 'cancellation' ? go('/info/cancellation') : id === 'sell' ? go('/info/sell') : id === 'about' ? go('/info/about') : go(`/account/${id}`);
  const title = ACCOUNT_SECTIONS.find(s => s[0] === section)?.[1] || 'My account';
  return <section className="day3-page account-page"><div className="page-topline"><button className="back-link" onClick={() => go('/')}>← Back to shopping</button><span className="eyebrow">YOUR FRESHNEST SPACE</span></div>
    <div className="page-title"><div><h1>My account</h1><p>Manage your orders, preferences and personal details.</p></div></div>
    <div className="account-layout"><aside className="account-sidebar"><div className="account-profile"><span className="account-avatar">{(profile.name || profile.phone || 'FN').slice(0, 2).toUpperCase()}</span><div><b>{profile.name || 'Welcome back'}</b><small>{profile.phone ? `+91 ${profile.phone}` : 'Add your details'}</small></div></div>
      {ACCOUNT_SECTIONS.map(([id, name, emoji]) => <button key={id} className={section === id ? 'active' : ''} onClick={() => pick(id)}><span>{emoji}</span>{name}<span className="account-chevron">›</span></button>)}
      {authUser?.role==='ADMIN' && <button onClick={()=>go('/admin')}>🛠️ Admin dashboard</button>}{['CUSTOMER','SELLER'].includes(authUser?.role) && <button onClick={()=>go('/seller')}>🏪 Seller workspace</button>}{authUser?.role==='DELIVERY_PARTNER' && <button onClick={()=>go('/delivery')}>🛵 Delivery workspace</button>}
      <button onClick={onLogout}><span>↪</span>Logout<span className="account-chevron">›</span></button></aside>
      <div className="account-content"><span className="eyebrow">ACCOUNT</span><h2>{title}</h2>
        {section === 'profile' && <Profile />}{section === 'orders' && <Orders />}{section === 'addresses' && <AddressList />}{section === 'wishlist' && <Wishlist />}
        {section === 'coupons' && <Coupons />}{section === 'gst' && <Gst />}{section === 'privacy' && <Privacy onLogout={onLogout} />}</div></div></section>;
}

function Profile() {
  const { profile, setProfile, notify } = useApp(); const [f, setF] = useState(profile); const [err, setErr] = useState('');
  const submit = async e => { e.preventDefault(); if (!f.name.trim()) return setErr('Enter your name.'); if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) return setErr('Enter a valid email address.'); if (f.phone && !/^[6-9]\d{9}$/.test(f.phone)) return setErr('Enter a valid 10-digit mobile number.'); try {const {user}=await api('/auth/profile',{method:'PATCH',body:{name:f.name,email:f.email}});setErr('');setProfile({...user,name:user.name||'',email:user.email||''});notify('Profile saved');}catch(e){setErr(e.message);} };
  return <form className="account-info" onSubmit={submit}><label className="field-label">NAME</label><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /><label className="field-label">EMAIL</label><input value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /><label className="field-label">PHONE</label><input readOnly inputMode="numeric" maxLength={10} value={f.phone} onChange={e => setF({ ...f, phone: e.target.value.replace(/\D/g, '') })} />{err && <p className="error">{err}</p>}<button className="primary" type="submit">Save changes</button></form>;
}

function Orders() {
  const { orders, reorder, notify, updateOrder } = useApp(); const [tab, setTab] = useState('current'); const [bill, setBill] = useState(null);
  const isPast = o => ['cancelled','returned','delivered'].includes(o.status);
  const list = orders.filter(o => tab === 'past' ? isPast(o) : !isPast(o));
  return <><div className="type-row"><button className={tab === 'current' ? 'chosen' : ''} onClick={() => setTab('current')}>Current</button><button className={tab === 'past' ? 'chosen' : ''} onClick={() => setTab('past')}>Past</button></div>
    {list.length === 0 ? <div className="account-empty"><span>🛍️</span><h3>No {tab} orders</h3><button className="primary" onClick={() => go('/')}>Start shopping</button></div> : list.map(o => <article className="account-order col" key={o.id}>
      <div className="ao-top"><div><b>Order #{o.id}</b><small>{o.items.length} items · {o.date} · {o.status === 'cancelled' ? 'Cancelled' : stageOf(o) === 6 ? 'Delivered' : 'In progress'}</small></div><strong>{money(o.total)}</strong></div>
      <div className="row-actions"><button className="primary" onClick={() => go(`/track/${o.id}`)}>{isPast(o) ? 'Order details' : 'Track order'}</button><button className="secondary" onClick={() => setBill(bill === o.id ? null : o.id)}>View bill</button>
        <button className="secondary" onClick={async () => { try {const r = await reorder(o); notify(`${r.added} item(s) added to cart${r.skipped ? `, ${r.skipped} unavailable` : ''}`);}catch(e){notify(e.message);} }}>Reorder</button>
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

function Gst() {
  const { gst, setGst, notify } = useApp(); const [f, setF] = useState(gst);
  return <div className="account-info"><label className="field-label">BUSINESS NAME</label><input value={f.business} onChange={e => setF({ ...f, business: e.target.value })} /><label className="field-label">GSTIN</label><input maxLength={15} value={f.gstin} onChange={e => setF({ ...f, gstin: e.target.value.toUpperCase() })} placeholder="15-character GSTIN" /><label className="field-label">BILLING ADDRESS</label><textarea rows={2} value={f.billing} onChange={e => setF({ ...f, billing: e.target.value })} /><p className="muted">GSTIN is saved as entered and is not verified against any government service.</p><button className="primary" onClick={() => { setGst(f); notify('GST details saved'); }}>Save GST details</button></div>;
}

function Privacy({ onLogout }) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const requestDeletion = async () => {
    setSending(true);
    setError('');
    try {
      await api('/support/tickets', {
        method: 'POST',
        body: { subject: 'Account deletion request', message: 'Please review my request to delete my FreshNest account and personal data.' }
      });
      go('/support?tab=tickets');
    } catch (error) {
      setError(error.message);
    } finally {
      setSending(false);
    }
  };
  return <div className="account-info">
    <p>FreshNest stores your account details, addresses and orders to provide its services.</p>
    <button className="secondary" onClick={onLogout}>Log out</button>
    <h3>Account deletion</h3>
    <p>Send a request for review. You can follow its status in My tickets.</p>
    {error && <p role="alert" className="error">{error}</p>}
    <button className="secondary danger" disabled={sending} onClick={requestDeletion}>
      {sending ? 'Sending…' : 'Request account deletion'}
    </button>
  </div>;
}
