import React from 'react';
import { Heart, Plus, Minus } from 'lucide-react';
import { ProductImage } from './ProductImage.jsx';
import { useApp, go } from '../lib/store.jsx';
import { money } from '../lib/money.js';
import { sellPrice } from '../data/products.js';

export function QtyControl({ id, small }) {
  const { cart, changeQty } = useApp(); const q = cart[id] || 0;
  return <div className="qty-control"><button onClick={() => changeQty(id, -1)} aria-label="Decrease quantity"><Minus size={small ? 13 : 14} /></button><b>{q}</b><button onClick={() => changeQty(id, 1)} aria-label="Increase quantity"><Plus size={small ? 13 : 14} /></button></div>;
}
export function AddOrQty({ p, small }) {
  const { cart, changeQty } = useApp();
  if (p.stock === 0) return <button className="add-button" disabled>Sold out</button>;
  return (cart[p.id] || 0) === 0 ? <button className="add-button" onClick={() => changeQty(p.id, 1)}>ADD <Plus size={small ? 14 : 15} /></button> : <QtyControl id={p.id} small={small} />;
}

export function ProductCard({ p }) {
  const { wish, toggleWish, cart, viewProduct } = useApp();
  const open = () => { viewProduct(p.id); go(`/product/${p.id}`); };
  return <article className={`product-card ${p.stock === 0 ? 'oos' : ''}`}>
    <button className={`wish ${wish.includes(p.id) ? 'active' : ''}`} aria-label={wish.includes(p.id) ? 'Remove from wishlist' : 'Add to wishlist'} onClick={() => toggleWish(p.id)}><Heart size={17} fill={wish.includes(p.id) ? 'currentColor' : 'none'} /></button>
    {p.discount > 0 && <span className="disc-badge">{p.discount}% OFF</span>}
    <div className="card-click" onClick={open} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && open()}><ProductImage product={p} /></div>
    <div className="product-info">
      <span className="product-category">{p.category}</span>
      <h3 className="linklike" onClick={open}>{p.name}</h3>
      <p className="product-brand">{p.brand}</p>
      <p className="unit">{p.unit} <span>★ {p.rating}</span></p>
      <div className="product-bottom"><div><b>{money(sellPrice(p))}</b>{p.discount > 0 && <del>{money(p.price)}</del>}<small>Inclusive of all taxes</small></div><AddOrQty p={p} /></div>
      <small className={`stock-line ${p.stock === 0 ? 'out' : p.stock < 12 ? 'low' : ''}`}>{p.stock === 0 ? 'Out of stock' : p.stock - (cart[p.id] || 0) < 12 ? `Only ${p.stock - (cart[p.id] || 0)} left` : 'In stock'}</small>
    </div>
  </article>;
}

export function ProductRow({ title, eyebrow, sub, items: raw, onAll }) {
  const items = [...new Map(raw.map(p => [p.id, p])).values()]; // de-duplicate by id
  if (!items.length) return null;
  return <section className="shop-section row-section"><div className="section-heading"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2>{sub && <p>{sub}</p>}</div>{onAll && <button className="view-all" onClick={onAll}>View all →</button>}</div><div className="h-scroll">{items.map(p => <div className="h-item" key={p.id}><ProductCard p={p} /></div>)}</div></section>;
}
