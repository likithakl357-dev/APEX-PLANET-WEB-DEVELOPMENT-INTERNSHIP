import React from 'react';
import { Leaf, Clock3 } from 'lucide-react';
import { useApp, go } from '../lib/store.jsx';
import { products, categoryList, productById, brands } from '../data/products.js';
import { SERVICE_AREAS } from '../data/config.js';
import { ProductRow } from '../components/ProductCard.jsx';

const inCat = (name, n = 12) => products.filter(p => p.category === name).slice(0, n);

export default function Home({ onLocation }) {
  const { recent, orders, selectedAddress } = useApp();
  const area = SERVICE_AREAS.find(a => a.pin === selectedAddress?.pin);

  const bestsellers = products.filter(p => p.tag === 'Bestseller').slice(0, 12);
  const trending = products.filter(p => p.trending && p.stock > 0).slice(0, 12);
  const essentials = [...inCat('Dairy, Bread & Eggs', 5), ...inCat('Atta, Rice & Dal', 4), ...inCat('Oil, Ghee & Masala', 3)];
  const specials = products.filter(p => p.discount >= 15).slice(0, 12);
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
    <section className="hero"><div className="hero-content"><h1>Fresh groceries,<br /><em>every day.</em></h1><p>From fresh produce to pantry essentials, find everything you need for your next shop.</p><button className="hero-cta" onClick={() => go('/search?q=')}>Shop groceries</button></div><div className="hero-art" aria-hidden="true"><div className="hero-circle"><img className="hero-logo" src="/brand/logo-stacked.svg" alt="" width="196" height="110" /></div><span className="hero-float f1">🥑</span><span className="hero-float f2">🍊</span><span className="hero-float f3">🥦</span><span className="hero-float f4">🍓</span></div></section>

    <section className={`eta-banner ${area && !area.serviceable ? 'bad' : ''}`}>
      <Clock3 size={20} />
      <div>{area ? (area.serviceable ? <><b>Delivery in about {area.eta} minutes</b> to {area.area}</> : <><b>Sorry, we don’t deliver here yet.</b> {area.area}. Try another location.</>) : <b>Choose a delivery location to see availability.</b>}</div>
      <button className="secondary" onClick={onLocation}>Change location</button>
    </section>

    <section className="promo-row">
      <button className="promo p1" onClick={() => go('/offers')}><b>First order? 25% off</b><span>Use code FIRST25 · up to ₹125</span></button>
      <button className="promo p2" onClick={() => go('/offers')}><b>Free delivery from ₹499</b><span>Fill your basket, skip the fee</span></button>
      <button className="promo p3" onClick={() => goCat('Pooja Essentials')}><b>Festive shopping</b><span>Pooja essentials & sweets</span></button>
    </section>

    <section className="category-section"><div className="section-heading"><div><h2>Shop by category</h2></div></div>
      <div className="category-grid">{categoryList.map((c, i) => <button className="category-tile" key={c.name} onClick={() => goCat(c.name)}><span className={`category-emoji tint-${i % 6}`}>{c.emoji}</span><b>{c.name}</b><small>{c.sub}</small></button>)}</div></section>

    <ProductRow title="Bestsellers" items={bestsellers} onAll={() => go('/search?q=')} />
    <ProductRow title="Trending products" items={trending} />
    <ProductRow title="Daily essentials" items={essentials} onAll={() => goCat('Dairy, Bread & Eggs')} />
    <ProductRow title="Fresh fruits & vegetables" items={inCat('Fruits & Vegetables', 14)} onAll={() => goCat('Fruits & Vegetables')} />
    <ProductRow title="Special discounts" items={specials} onAll={() => go('/offers')} />
    {fbt.length > 0 && <ProductRow title="More to explore" items={fbt} />}
    <ProductRow title="Recently viewed" items={recentItems} />
    {bought.length > 0 && <ProductRow title="Buy again" sub="From your previous orders" items={bought} />}
    <ProductRow title="Recommended products" sub={favCats.size ? 'Based on categories you recently viewed.' : 'Highly rated picks to start with.'} items={recommended} />
    <ProductRow title="New arrivals" items={newArrivals} />
    <section className="category-section"><div className="section-heading"><div><span className="eyebrow">TOP BRANDS</span><h2>Brand showcase</h2></div></div><div className="brand-row">{brandShow.map(b => <button key={b} className="brand-chip" onClick={() => go(`/search?q=${encodeURIComponent(b)}`)}>{b}</button>)}</div></section>
    <ProductRow title="Seasonal offers" items={festive} onAll={() => goCat('Pooja Essentials')} />
    <section className="promise"><div><span className="promise-icon"><Leaf /></span><div><span className="eyebrow">THE FRESHNEST PROMISE</span><h2>Goodness in every basket.</h2><p>Thoughtfully selected everyday essentials, with a shopping experience that keeps things simple.</p></div></div></section>
  </>;
}

