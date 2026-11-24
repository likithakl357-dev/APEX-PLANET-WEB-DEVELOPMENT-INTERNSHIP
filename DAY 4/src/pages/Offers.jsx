import React from 'react';
import { useApp, go } from '../lib/store.jsx';
import { COUPONS, FEES } from '../data/config.js';
import { products } from '../data/products.js';
import { ProductRow } from '../components/ProductCard.jsx';

export default function Offers() {
  const { savedCoupons, setSavedCoupons, notify } = useApp();
  const toggle = code => setSavedCoupons(s => s.includes(code) ? s.filter(x => x !== code) : [...s, code]);
  const pairs = products.filter(p => p.tag === 'Bestseller' && p.stock > 0).slice(0, 4);
  return <section className="day3-page">
    <div className="page-title"><div><h1>Today’s offers</h1><p>Save a coupon and apply it to an eligible order at checkout.</p></div></div>
    <div className="coupon-grid">{COUPONS.map(c => <div className="panel coupon-card" key={c.code}><b className="code">{c.code}</b><p>{c.title}</p><div className="row-actions"><button className="secondary" onClick={() => toggle(c.code)}>{savedCoupons.includes(c.code) ? 'Saved ✓' : 'Save coupon'}</button><button className="primary" onClick={async () => { try { await navigator.clipboard.writeText(c.code); notify(`${c.code} copied`); } catch { notify(`Enter ${c.code} at checkout`); } }}>Copy code</button></div></div>)}</div>
    <div className="panel"><p>Free delivery on qualifying orders from ₹{FEES.freeDeliveryAbove}.</p></div>
    <ProductRow title="Popular picks" items={pairs} />
    <ProductRow title="Biggest discounts" items={products.filter(p => p.discount >= 15)} />
    <button className="primary" onClick={() => go('/search?q=')}>Browse all products</button>
  </section>;
}
