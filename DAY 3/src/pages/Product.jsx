import React, { useEffect, useMemo, useState } from 'react';
import { Heart, Bell } from 'lucide-react';
import { useApp, go } from '../lib/store.jsx';
import { productById, products, sellPrice } from '../data/products.js';
import { money } from '../lib/money.js';
import { ProductImage } from '../components/ProductImage.jsx';
import { AddOrQty, ProductRow } from '../components/ProductCard.jsx';

const REVIEWERS = ['Priya S.', 'Karthik R.', 'Anita M.', 'Rahul D.', 'Meena V.'];
const COMMENTS = ['Good quality and well packed.', 'Value for money, will buy again.', 'Delivered fresh. Packaging could be better.', 'As described. Happy with it.', 'Decent product, average packing.'];
const NA = <span className="muted">Not provided (sample data)</span>;

export default function Product({ id }) {
  const { wish, toggleWish, viewProduct, alerts, setAlerts, notify } = useApp();
  const p = productById[id];
  const [variant, setVariant] = useState(0);
  useEffect(() => { if (p) viewProduct(p.id); setVariant(0); }, [id]);
  const related = useMemo(() => p ? products.filter(x => x.category === p.category && x.id !== p.id && x.stock > 0).slice(0, 10) : [], [id]);
  const similar = useMemo(() => p ? products.filter(x => x.brand === p.brand && x.id !== p.id).slice(0, 8) : [], [id]);
  if (!p) return <section className="day3-page"><div className="empty-state"><h3>Product not found</h3><button className="primary" onClick={() => go('/')}>Back to home</button></div></section>;

  // SAMPLE variants: price scales with size. Real variant data will come from the catalogue API.
  const variants = [{ label: p.unit, mult: 1 }, { label: 'Value pack (2×)', mult: 1.85 }, { label: 'Family pack (4×)', mult: 3.5 }];
  const v = variants[variant]; const price = Math.round(sellPrice(p) * v.mult); const mrp = Math.round(p.price * v.mult);
  const alts = p.stock === 0 ? products.filter(x => x.category === p.category && x.stock > 0).slice(0, 4) : [];
  const has = (k) => alerts[k].includes(p.id);
  const toggleAlert = k => { setAlerts(a => ({ ...a, [k]: has(k) ? a[k].filter(x => x !== p.id) : [...a[k], p.id] })); notify(has(k) ? 'Alert removed' : 'We’ll notify you (demo — no real notification is sent)'); };
  const reviews = REVIEWERS.map((n, i) => ({ n, stars: Math.max(3, Math.round(Number(p.rating) - (i % 3 === 2 ? 1 : 0))), t: COMMENTS[(Number(p.id.split('-')[1]) + i) % COMMENTS.length] }));

  return <section className="day3-page product-page">
    <div className="page-topline"><button className="back-link" onClick={() => history.back()}>← Back</button><span className="crumbs">{p.category} › {p.name}</span></div>
    <div className="pd-layout">
      <div className="pd-media"><ProductImage product={p} /><small className="muted">Photos are shown only when a verified photo of this exact product is on file; otherwise a labelled placeholder is shown.</small></div>
      <div className="pd-info">
        <span className="eyebrow">{p.brand.toUpperCase()}</span><h1>{p.name}</h1><p className="muted">★ {p.rating} · {p.reviews} ratings (sample)</p>
        <div className="pd-price"><strong>{money(price)}</strong>{p.discount > 0 && <><del>{money(mrp)}</del><span className="disc-pill">{p.discount}% OFF</span></>}<small>MRP incl. all taxes · GST {p.gst}% (sample)</small></div>
        <label className="field-label">PACK SIZE (SAMPLE VARIANTS)</label>
        <div className="variants">{variants.map((x, i) => <button key={x.label} className={i === variant ? 'chosen' : ''} onClick={() => setVariant(i)}>{x.label}</button>)}</div>
        <div className="pd-actions">{variant === 0 ? <AddOrQty p={p} /> : <span className="muted">Value/family packs are display-only in this demo; add the base pack to cart.</span>}
          <button className={`secondary ${wish.includes(p.id) ? 'on' : ''}`} onClick={() => toggleWish(p.id)}><Heart size={15} fill={wish.includes(p.id) ? 'currentColor' : 'none'} /> {wish.includes(p.id) ? 'Saved' : 'Save'}</button>
          <button className="secondary" onClick={() => toggleAlert('priceDrop')}><Bell size={15} /> {has('priceDrop') ? 'Price alert on' : 'Price-drop alert'}</button>
          {p.stock === 0 && <button className="secondary" onClick={() => toggleAlert('backInStock')}><Bell size={15} /> {has('backInStock') ? 'Will notify you' : 'Notify when back in stock'}</button>}</div>
        <p className={`stock-line ${p.stock === 0 ? 'out' : ''}`}>{p.stock === 0 ? 'Currently out of stock' : p.stock < 12 ? `Only ${p.stock} left` : 'In stock'}</p>
        {alts.length > 0 && <div className="alt-box"><b>Try these instead</b><div className="chips">{alts.map(a => <button key={a.id} className="chip" onClick={() => go(`/product/${a.id}`)}>{a.name}</button>)}</div></div>}
        <div className="panel info-table"><h2>Product information</h2>
          <dl><dt>Description</dt><dd>{p.desc} <span className="muted">(sample text)</span></dd><dt>Ingredients</dt><dd>{NA}</dd><dt>Nutritional information</dt><dd>{NA}</dd><dt>Manufacturer</dt><dd>{NA}</dd><dt>Shelf life / expiry</dt><dd>{NA}</dd><dt>Category</dt><dd>{p.category}</dd></dl></div>
      </div>
    </div>
    <div className="panel"><h2>Customer reviews <small className="muted">(sample reviews, not real customers)</small></h2>{reviews.map(r => <div className="review" key={r.n}><b>{r.n}</b> <span className="stars">{'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}</span><p>{r.t}</p></div>)}</div>
    <ProductRow title="Related products" items={related} />
    <ProductRow title={`More from ${p.brand}`} items={similar} />
  </section>;
}
