import React, { useEffect, useRef } from 'react';
import { X, ArrowRight, Trash2 } from 'lucide-react';
import { useApp, go } from '../lib/store.jsx';
import { computeBill } from '../lib/pricing.js';
import { FEES } from '../data/config.js';
import { products, sellPrice, productById } from '../data/products.js';
import { money } from '../lib/money.js';
import { QtyControl, AddOrQty } from './ProductCard.jsx';
import { ProductThumb } from './ProductImage.jsx';

export function CartDrawer({ onClose }) {
  const closeButton = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    closeButton.current?.focus();
    return () => previous?.focus();
  }, []);
  const { cart, cartCount, removeFromCart } = useApp();
  const bill = computeBill({ cart, coupon: null, gift: false, tip: 0 });
  const recs = products.filter(p => p.stock > 0 && !cart[p.id] && (bill.lines.length ? bill.lines.some(l => l.p.category === p.category) : p.tag === 'Bestseller')).slice(0, 4);
  const toGo = Math.max(0, FEES.freeDeliveryAbove - bill.subtotal);
  return <div className="overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}><aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping cart" onKeyDown={event => { if (event.key === 'Escape') onClose(); }}>
    <div className="drawer-head"><div><span className="eyebrow">YOUR FRESH PICKS</span><h2>My basket <small>({cartCount} {cartCount === 1 ? 'item' : 'items'})</small></h2></div><button ref={closeButton} className="close" onClick={onClose} aria-label="Close cart"><X /></button></div>
    {Object.keys(cart).filter(id=>!productById[id]).map(id=><div className="cart-row" key={id}><span>Unavailable product</span><button className="secondary" onClick={()=>removeFromCart(id)}>Remove</button></div>)}
    {bill.lines.length === 0 ? <div className="cart-empty"><span>🧺</span><h3>Your basket is waiting</h3><p>Add a few fresh favourites to get started.</p><button className="primary" onClick={() => { onClose(); go('/search?q='); }}>Explore products</button></div> : <>
      <div className="cart-items">{bill.lines.map(l => <div className="cart-row" key={l.p.id}><span className="cart-emoji"><ProductThumb product={l.p} /></span><div className="cart-description"><b>{l.p.name}</b><small>{l.p.unit}</small><strong>{money(l.total)}</strong>{l.p.discount > 0 && <del className="muted"> {money(l.mrpTotal)}</del>}</div><QtyControl id={l.p.id} small /><button className="icon-btn" aria-label={`Remove ${l.p.name}`} onClick={() => removeFromCart(l.p.id)}><Trash2 size={15} /></button></div>)}
        {recs.length > 0 && <div className="cart-recs"><b>You might also like</b>{recs.map(p => <div className="mini-row" key={p.id}><span className="mini-thumb"><ProductThumb product={p} /></span><div><b>{p.name}</b><small>{money(sellPrice(p))}</small></div><AddOrQty p={p} small /></div>)}</div>}</div>
      <div className="bill">
        <div><span>Item total (MRP {money(bill.mrpTotal)})</span><b>{money(bill.subtotal)}</b></div>
        {bill.productDiscount > 0 && <div><span>You save</span><b className="free">{money(bill.productDiscount)}</b></div>}
        <div><span>Delivery</span><b>{bill.delivery ? money(bill.delivery) : <em className="free">FREE</em>}</b></div>
        {toGo > 0 && <p className="fee-note">Add {money(toGo)} more for free delivery.</p>}
        <p className="fee-note subtle">Handling and other fees are shown at checkout.</p>
        <button className="primary wide" onClick={() => { onClose(); go('/checkout'); }}>Proceed to checkout <ArrowRight size={17} /></button>
        <button className="text-button" onClick={onClose}>Continue shopping</button>
      </div></>}
  </aside></div>;
}
