import React, { useMemo, useState, useEffect } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useApp, go } from '../lib/store.jsx';
import { products, categoryList, brands } from '../data/products.js';
import { applyFilters, DEFAULT_FILTERS, POPULAR_SEARCHES, searchMeta } from '../lib/search.js';
import { ProductCard } from '../components/ProductCard.jsx';

export default function Search() {
  const { route } = useApp();
  const q = route.params.q || ''; const cat = route.params.cat || 'All';
  const [f, setF] = useState({ ...DEFAULT_FILTERS, category: cat });
  const [sort, setSort] = useState('relevance'); const [open, setOpen] = useState(false); const [limit, setLimit] = useState(24);
  useEffect(() => { setF(x => ({ ...x, category: cat })); setLimit(24); }, [cat, q]);
  const list = useMemo(() => applyFilters(products, q, f, sort), [q, f, sort]);
  const meta = useMemo(() => (q.trim() ? searchMeta(q) : null), [q]);
  const set = patch => { setF(x => ({ ...x, ...patch })); setLimit(24); };
  const toggleBrand = b => set({ brands: f.brands.includes(b) ? f.brands.filter(x => x !== b) : [...f.brands, b] });
  const poolBrands = useMemo(() => [...new Set(applyFilters(products, q, { ...f, brands: [] }, 'az').map(p => p.brand))].sort(), [q, f]);
  const active = f.category !== 'All' || f.brands.length || f.min !== '' || f.max !== '' || f.discount || f.rating || f.inStock || f.type !== 'All';

  return <section className="shop-section search-page">
    <div className="section-heading shop-heading"><div><span className="eyebrow">{q ? 'SEARCH RESULTS' : 'THE FRESHNEST COLLECTION'}</span><h2>{q ? `Results for “${q}”` : f.category === 'All' ? 'All products' : f.category}</h2><p aria-live="polite">{list.length} product{list.length === 1 ? '' : 's'} found{meta?.corrected && list.length > 0 && <> · showing results for <b>“{meta.display}”</b> (you typed “{q}”)</>}</p></div>
      <div className="shop-tools"><button className="deal-toggle filter-toggle" onClick={() => setOpen(!open)}><SlidersHorizontal size={16} /> Filters</button>
        {q.trim() && <button className="deal-toggle clear-search" onClick={() => go('/search?q=')}>Clear search ✕</button>}
        <select value={sort} onChange={e => setSort(e.target.value)} aria-label="Sort products"><option value="relevance">{q.trim() ? 'Relevance' : 'Popularity'}</option><option value="popular">Most reviewed</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="discount">Highest discount</option><option value="rating">Highest rated</option><option value="az">Alphabetical (A–Z)</option></select></div></div>
    <div className="search-layout">
      <aside className={`filters ${open ? 'open' : ''}`}>
        <div className="f-head"><b>Filters</b>{active && <button className="text-link" onClick={() => setF({ ...DEFAULT_FILTERS })}>Reset all</button>}</div>
        <label className="field-label">CATEGORY</label><select value={f.category} onChange={e => set({ category: e.target.value })}><option>All</option>{categoryList.map(c => <option key={c.name}>{c.name}</option>)}</select>
        <label className="field-label">PRICE (₹)</label><div className="price-inputs"><input type="number" min="0" placeholder="Min" value={f.min} onChange={e => set({ min: e.target.value })} /><input type="number" min="0" placeholder="Max" value={f.max} onChange={e => set({ max: e.target.value })} /></div>
        <label className="field-label">DISCOUNT</label><select value={f.discount} onChange={e => set({ discount: Number(e.target.value) })}><option value={0}>Any</option><option value={10}>10% and above</option><option value={15}>15% and above</option></select>
        <label className="field-label">RATING</label><select value={f.rating} onChange={e => set({ rating: Number(e.target.value) })}><option value={0}>Any</option><option value={4}>4★ and above</option><option value={4.5}>4.5★ and above</option></select>
        <label className="field-label">PRODUCT TYPE</label><select value={f.type} onChange={e => set({ type: e.target.value })}><option>All</option><option>Branded</option><option>FreshNest own</option></select>
        <label className="check"><input type="checkbox" checked={f.inStock} onChange={e => set({ inStock: e.target.checked })} /> In stock only</label>
        <label className="field-label">BRAND</label><div className="brand-list">{poolBrands.map(b => <label className="check" key={b}><input type="checkbox" checked={f.brands.includes(b)} onChange={() => toggleBrand(b)} /> {b}</label>)}</div>
      </aside>
      <div>
        {list.length === 0 ? <div className="empty-state"><h3>No products found{q.trim() ? <> for “{q.trim()}”</> : ''}</h3><p>{active && q.trim() && applyFilters(products, q, DEFAULT_FILTERS, 'relevance').length > 0 ? 'Your filters are hiding every match. Reset them to see the results.' : 'We could not find anything that matches. Check the spelling, try a simpler word, or pick a popular search.'}</p><div className="chips center">{POPULAR_SEARCHES.map(s => <button key={s} className="chip" onClick={() => go(`/search?q=${s}`)}>{s}</button>)}</div>{active && <button className="primary" onClick={() => setF({ ...DEFAULT_FILTERS })}>Clear filters</button>}{q.trim() && <button className="secondary" onClick={() => go('/search?q=')}>Clear search</button>}</div>
          : <><div className="product-grid g3">{list.slice(0, limit).map(p => <ProductCard key={p.id} p={p} />)}</div>{list.length > limit && <button className="load-more" onClick={() => setLimit(limit + 24)}>Show more ({list.length - limit} left)</button>}</>}
      </div>
    </div>
  </section>;
}
