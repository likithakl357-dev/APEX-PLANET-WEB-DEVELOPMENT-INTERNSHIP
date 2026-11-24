import React, { useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useApp, go } from '../lib/store.jsx';
import { productById, products, sellPrice } from '../data/products.js';
import { money } from '../lib/money.js';
import { ProductImage } from '../components/ProductImage.jsx';
import { AddOrQty, ProductRow } from '../components/ProductCard.jsx';

export default function Product({ id }) {
  const { wish, toggleWish, viewProduct } = useApp();
  const p = productById[id];
  useEffect(() => { if (p) viewProduct(p.id); }, [id]);
  if (!p) return <section className="day3-page"><div className="empty-state"><h3>Product not found</h3><button className="primary" onClick={() => go('/')}>Back to home</button></div></section>;

  const related = products.filter(x => x.category === p.category && x.id !== p.id && x.stock > 0).slice(0, 10);
  const similar = products.filter(x => x.brand === p.brand && x.id !== p.id).slice(0, 8);
  const alts = p.stock === 0 ? related.slice(0, 4) : [];

  return <section className="day3-page product-page">
    <div className="page-topline"><button className="back-link" onClick={() => history.back()}>← Back</button><span className="crumbs">{p.category} › {p.name}</span></div>
    <div className="pd-layout">
      <div className="pd-media"><ProductImage product={p} /></div>
      <div className="pd-info">
        <span className="eyebrow">{p.brand.toUpperCase()}</span><h1>{p.name}</h1>
        <div className="pd-price"><strong>{money(sellPrice(p))}</strong>{p.discount > 0 && <><del>{money(p.price)}</del><span className="disc-pill">{p.discount}% OFF</span></>}<small>MRP incl. all taxes</small></div>
        <p className="muted">Pack size · {p.unit}</p>
        <div className="pd-actions"><AddOrQty p={p} />
          <button className={`secondary ${wish.includes(p.id) ? 'on' : ''}`} onClick={() => toggleWish(p.id)}><Heart size={15} fill={wish.includes(p.id) ? 'currentColor' : 'none'} /> {wish.includes(p.id) ? 'Saved' : 'Save'}</button>
        </div>
        <p className={`stock-line ${p.stock === 0 ? 'out' : ''}`}>{p.stock === 0 ? 'Currently out of stock' : p.stock < 12 ? `Only ${p.stock} left` : 'In stock'}</p>
        {alts.length > 0 && <div className="alt-box"><b>Try these instead</b><div className="chips">{alts.map(a => <button key={a.id} className="chip" onClick={() => go(`/product/${a.id}`)}>{a.name}</button>)}</div></div>}
        <div className="panel info-table"><h2>Product information</h2>
          <dl><dt>Description</dt><dd>{p.desc}</dd><dt>Category</dt><dd>{p.category}</dd></dl></div>
      </div>
    </div>
    <ProductRow title="Related products" items={related} />
    <ProductRow title={`More from ${p.brand}`} items={similar} />
  </section>;
}
