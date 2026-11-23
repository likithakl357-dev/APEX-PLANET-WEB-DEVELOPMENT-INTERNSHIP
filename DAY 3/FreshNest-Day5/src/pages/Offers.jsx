import React from 'react';
import { useApp, go } from '../lib/store.jsx';
import { COUPONS, BANK_OFFERS, FEES } from '../data/config.js';
import { products } from '../data/products.js';
import { ProductRow } from '../components/ProductCard.jsx';

export default function Offers() {
  const { savedCoupons, setSavedCoupons, notify } = useApp();
  const toggle = code => setSavedCoupons(s => s.includes(code) ? s.filter(x => x !== code) : [...s, code]);
  const pairs = products.filter(p => p.tag === 'Bestseller' && p.stock > 0).slice(0, 4);
  return <section className="day3-page">
    <div className="page-title"><div><h1>Today’s offers</h1><p>Sample coupons and offers for the frontend demo.</p></div></div>
    <div className="coupon-grid">{COUPONS.map(c => <div className="panel coupon-card" key={c.code}><b className="code">{c.code}</b><p>{c.title}</p><div className="row-actions"><button className="secondary" onClick={() => toggle(c.code)}>{savedCoupons.includes(c.code) ? 'Saved ✓' : 'Save coupon'}</button><button className="primary" onClick={() => { navigator.clipboard?.writeText(c.code); notify(`${c.code} copied — apply it at checkout`); }}>Copy code</button></div></div>)}</div>
    <div className="panel"><h2>Bank offers & cashback <small className="muted">(demonstration only)</small></h2>{BANK_OFFERS.map(b => <p key={b.id}>🏦 {b.text}</p>)}</div>
    <div className="panel"><h2>Bundle & BOGO ideas</h2><p>🎁 Buy any 2 bestsellers below and save with free delivery above ₹{FEES.freeDeliveryAbove}. <span className="muted">(Bundle pricing is a display demo; no separate bundle discount is calculated.)</span></p></div>
    <ProductRow title="Bestsellers worth a bundle" items={pairs} />
    <ProductRow title="Biggest discounts" items={products.filter(p => p.discount >= 15)} />
    <button className="primary" onClick={() => go('/search?q=')}>Browse all products</button>
  </section>;
}
