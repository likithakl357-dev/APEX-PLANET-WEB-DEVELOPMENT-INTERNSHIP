import React, { useEffect, useState } from 'react';
import { ArrowRight, Leaf, Sparkles, Clock3 } from 'lucide-react';
import { useApp, go } from '../lib/store.jsx';
import { products, categoryList, productById, brands, sellPrice } from '../data/products.js';
import { SERVICE_AREAS } from '../data/config.js';
import { ProductRow, AddOrQty } from '../components/ProductCard.jsx';
import { ProductThumb } from '../components/ProductImage.jsx';
import { money } from '../lib/money.js';

const inCat = (name, n = 12) => products.filter(p => p.category === name).slice(0, n);
const hash = s => [...s].reduce((a, c) => a + c.charCodeAt(0), 0);

export default function Home({ onLocation }) {
  const { recent, orders, selectedAddress } = useApp();
  const [left, setLeft] = useState(() => 3 * 3600 + 25 * 60);
  useEffect(() => { const t = setInterval(() => setLeft(s => (s > 0 ? s - 1 : 3 * 3600)), 1000); return () => clearInterval(t); }, []);
  const hh = String(Math.floor(left / 3600)).padStart(2, '0'), mm = String(Math.floor(left % 3600 / 60)).padStart(2, '0'), ss = String(left % 60).padStart(2, '0');
  const area = SERVICE_AREAS.find(a => a.pin === selectedAddress?.pin);

  const bestsellers = products.filter(p => p.tag === 'Bestseller').slice(0, 12);
  const trending = products.filter(p => p.trending && p.stock > 0).slice(0, 12);
  const essentials = [...inCat('Dairy, Bread & Eggs', 5), ...inCat('Atta, Rice & Dal', 4), ...inCat('Oil, Ghee & Masala', 3)];
  const specials = products.filter(p => p.discount >= 15).slice(0, 12);
  const limited = products.filter(p => p.discount > 0 && p.stock > 0).slice(6, 18);
  const recentItems = recent.map(id => productById[id]).filter(Boolean);
  const boughtIds = [...new Set(orders.flatMap(o => o.items.map(i => i.id)))];
  const bought = boughtIds.map(id => productById[id]).filter(Boolean).slice(0, 12);
  const favCats = new Set(recentItems.map(p => p.category));
  const recommended = (favCats.size ? products.filter(p => favCats.has(p.category) && !recent.includes(p.id)) : products.filter(p => Number(p.rating) >= 4.7)).slice(0, 12);
  const fbt = (bought.length ? bought : bestsellers).slice(0, 6).map(p => products.find(x => x.category === p.category && x.id !== p.id && x.stock > 0)).filter(Boolean);
  const newArrivals = products.filter(p => p.isNew && p.stock > 0).slice(0, 12);
  const festive = [...inCat('Pooja Essentials', 6), ...inCat('Sweet Tooth', 6)];
  const brandShow = ['Amul', 'Tata Sampann', 'Haldiram’s', 'Cadbury', 'MAGGI', 'Dove'].filter(b => brands.includes(b));
  const goCat = name => go(`/search?cat=${encodeURIComponent(name)}`);

  return <>
    <section className="hero"><div className="hero-content"><span className="hero-kicker"><Sparkles size={14} /> YOUR DAILY DOSE OF FRESH</span><h1>Good food, <em>good days.</em></h1><p>Everything your kitchen loves, delivered fresh to your doorstep.</p><button className="hero-cta" onClick={() => go('/search?q=')}>Explore groceries <ArrowRight size={17} /></button><div className="hero-stats"><span><b>400</b><small>Sample products</small></span><i /><span><b>20</b><small>Curated categories</small></span><i /><span><b>{area?.eta ?? '—'} min</b><small>Demo ETA</small></span></div></div>
      <div className="hero-art"><div className="hero-circle"><img className="hero-logo" src="/brand/logo-stacked.svg" alt="FreshNest logo" width="196" height="110" /></div><span className="hero-float f1" aria-hidden="true">🥑</span><span className="hero-float f2" aria-hidden="true">🍊</span><span className="hero-float f3" aria-hidden="true">🥦</span><span className="hero-float f4" aria-hidden="true">🍓</span><div className="hero-note"><Leaf size={17} /> Freshness you can feel</div></div></section>

    <section className={`eta-banner ${area && !area.serviceable ? 'bad' : ''}`}>
      <Clock3 size={20} />
      <div>{area ? (area.serviceable ? <><b>Delivery in about {area.eta} minutes</b> to {area.area}</> : <><b>Sorry, we don’t deliver here yet.</b> {area.area}. Try another location.</>) : <b>Choose a delivery location to see availability.</b>}<small>Demo ETA from configurable mock data. No live delivery backend is connected yet.</small></div>
      <button className="secondary" onClick={onLocation}>Change location</button>
    </section>

    <section className="promo-row">
      <button className="promo p1" onClick={() => go('/offers')}><b>First order? 25% off</b><span>Use code FIRST25 · up to ₹125</span></button>
      <button className="promo p2" onClick={() => go('/offers')}><b>Free delivery above ₹499</b><span>Fill your basket, skip the fee</span></button>
      <button className="promo p3" onClick={() => goCat('Pooja Essentials')}><b>Festive shopping</b><span>Pooja essentials & sweets</span></button>
    </section>

    <section className="category-section"><div className="section-heading"><div><span className="eyebrow">A LITTLE SOMETHING FOR EVERYONE</span><h2>Shop by category</h2><p>Find exactly what your home needs.</p></div></div>
      <div className="category-grid">{categoryList.map((c, i) => <button className="category-tile" key={c.name} onClick={() => goCat(c.name)}><span className={`category-emoji tint-${i % 6}`}>{c.emoji}</span><b>{c.name}</b><small>{c.sub}</small></button>)}</div></section>

    <ProductRow eyebrow="CUSTOMER FAVOURITES" title="Bestsellers" items={bestsellers} onAll={() => go('/search?q=')} />
    <ProductRow eyebrow="WHAT’S HOT" title="Trending products" items={trending} />
    <ProductRow eyebrow="EVERY DAY" title="Daily essentials" items={essentials} onAll={() => goCat('Dairy, Bread & Eggs')} />
    <ProductRow eyebrow="FARM FRESH" title="Fresh fruits & vegetables" items={inCat('Fruits & Vegetables', 14)} onAll={() => goCat('Fruits & Vegetables')} />
    <ProductRow eyebrow="SAVE MORE" title="Special discounts" items={specials} onAll={() => go('/offers')} />
    <section className="limited"><div className="limited-head"><div><span className="eyebrow">LIMITED-TIME DEALS</span><h2>Ends in <span className="timer">{hh}:{mm}:{ss}</span></h2><p className="muted">Demo countdown that restarts; not tied to a real campaign.</p></div></div><div className="h-scroll">{limited.map(p => <div className="h-item" key={p.id}><MiniDeal p={p} /></div>)}</div></section>
    {fbt.length > 0 && <ProductRow eyebrow="DETERMINISTIC DEMO LOGIC" title="Frequently bought products" sub="Pairs from the same category as popular items. Not machine-learning recommendations." items={fbt} />}
    <ProductRow title="Recently viewed" items={recentItems} />
    {bought.length > 0 && <ProductRow title="Buy again" sub="From your previous orders" items={bought} />}
    <ProductRow eyebrow="FOR YOU" title="Recommended products" sub={favCats.size ? 'Based on categories you recently viewed (simple rule, not AI).' : 'Highly rated picks to start with.'} items={recommended} />
    <ProductRow eyebrow="JUST IN" title="New arrivals" items={newArrivals} />
    <section className="category-section"><div className="section-heading"><div><span className="eyebrow">TOP BRANDS</span><h2>Brand showcase</h2></div></div><div className="brand-row">{brandShow.map(b => <button key={b} className="brand-chip" onClick={() => go(`/search?q=${encodeURIComponent(b)}`)}>{b}</button>)}</div></section>
    <ProductRow eyebrow="FESTIVE & SEASONAL" title="Seasonal offers" items={festive} onAll={() => goCat('Pooja Essentials')} />
    <section className="promise"><div><span className="promise-icon"><Leaf /></span><div><span className="eyebrow">THE FRESHNEST PROMISE</span><h2>Goodness in every basket.</h2><p>Thoughtfully selected everyday essentials, with a shopping experience that keeps things simple.</p></div></div></section>
  </>;
}

function MiniDeal({ p }) {
  return <article className="deal-card"><span className="deal-art"><ProductThumb product={p} /></span><div className="deal-copy"><span className="deal-percent">{p.discount}% OFF</span><b>{p.name}</b><small>{p.unit}</small><div className="deal-price"><strong>{money(sellPrice(p))}</strong><del>{money(p.price)}</del></div><AddOrQty p={p} small /></div></article>;
}
