import React, { useState, useRef, useEffect } from 'react';
import { Search, ShoppingBasket, MapPin, ChevronDown, X, Heart, Menu, Clock3 } from 'lucide-react';
import { LogoMark } from './Logo.jsx';
import { useApp, go } from '../lib/store.jsx';
import { suggest, POPULAR_SEARCHES } from '../lib/search.js';
import { SERVICE_AREAS } from '../data/config.js';

export function Header({ onCart, onLocation }) {
  const { cartCount, wish, selectedAddress, recentSearches, addSearch, setRecentSearches, route, profile } = useApp();
  const [q, setQ] = useState(route.parts[0] === 'search' ? route.params.q || '' : ''); const [focus, setFocus] = useState(false); const [menu, setMenu] = useState(false);
  const box = useRef(null); const inputRef = useRef(null); const [active, setActive] = useState(-1);
  useEffect(() => { const f = e => { if (box.current && !box.current.contains(e.target)) setFocus(false); }; document.addEventListener('mousedown', f); return () => document.removeEventListener('mousedown', f); }, []);
  useEffect(() => { if (route.parts[0] !== 'search') setQ(''); }, [route]);
  const run = text => { addSearch(text); setQ(text); setFocus(false); go(`/search?q=${encodeURIComponent(text)}`); };
  const area = SERVICE_AREAS.find(a => a.pin === selectedAddress?.pin);
  const sug = suggest(q);
  useEffect(() => { setActive(-1); }, [q]);
  const pick = s => { setFocus(false); if (s.id) go(`/product/${s.id}`); else if (s.cat) go(`/search?cat=${encodeURIComponent(s.cat)}`); else run(s.q); };
  const onKey = e => {
    if (e.key === 'Escape') { setFocus(false); return; }
    if (!q.trim() || !sug.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocus(true); setActive(i => (i + 1) % sug.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(i => (i <= 0 ? sug.length - 1 : i - 1)); }
    else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); pick(sug[active]); }
  };
  const clear = () => { setQ(''); setActive(-1); inputRef.current?.focus(); };
  return <header className="header">
    <button className="menu-btn" aria-label="Menu" onClick={() => setMenu(!menu)}><Menu /></button>
    <button className="brand" onClick={() => go('/')}><span className="brand-icon"><LogoMark size={30} /></span><span>FreshNest<small>FRESHNESS AT YOUR DOORSTEP</small></span></button>
    <button className="location-pill" onClick={onLocation}><MapPin size={18} /><span><small>{area?.serviceable ? `DELIVERY IN ~${area.eta} MIN (DEMO)` : 'DELIVERING TO'}</small><b>{selectedAddress ? selectedAddress.text : 'Add delivery location'}</b></span><ChevronDown size={16} /></button>
    <div className="search-wrap" ref={box}>
      <form className="searchbar" onSubmit={e => { e.preventDefault(); if (q.trim()) run(q.trim()); }}>
        <Search size={19} />
        <input ref={inputRef} role="combobox" aria-expanded={focus && !!q.trim()} aria-autocomplete="list" aria-label="Search products, brands or categories" placeholder="Search products, brands…" value={q} autoComplete="off" onFocus={() => setFocus(true)} onKeyDown={onKey} onChange={e => { setQ(e.target.value); setFocus(true); }} />
        {q && <button className="search-clear" type="button" aria-label="Clear search" onClick={clear}><X size={16} /></button>}
        <button className="search-submit" type="submit">Search</button>
      </form>
      {focus && <div className="suggest-box">
        {q.trim() ? (sug.length ? sug.map((s, i) => <button key={`${s.kind}-${s.label}-${s.id || i}`} className={i === active ? 'active' : ''} onMouseEnter={() => setActive(i)} onClick={() => pick(s)}><Search size={14} /><span>{s.kind === 'Did you mean' ? <>Did you mean <b>{s.label}</b>?</> : s.label}{s.sub && <small className="sg-sub">{s.sub}</small>}</span><em>{s.kind === 'Did you mean' ? 'Suggestion' : s.kind}</em></button>) : <p className="muted pad">No matching products. Press Enter to search “{q}” anyway, or try a different spelling.</p>) : <>
          {recentSearches.length > 0 && <div className="sg-group"><div className="sg-title">Recent searches <button onClick={() => setRecentSearches([])}>Clear</button></div>{recentSearches.map(r => <button key={r} onClick={() => run(r)}><Clock3 size={14} /><span>{r}</span></button>)}</div>}
          <div className="sg-group"><div className="sg-title">Popular searches</div><div className="chips">{POPULAR_SEARCHES.map(r => <button key={r} className="chip" onClick={() => run(r)}>{r}</button>)}</div></div></>}
      </div>}
    </div>
    <button className="icon-pill" onClick={() => go('/account/wishlist')} aria-label="Wishlist"><Heart size={19} />{wish.length > 0 && <b className="dot">{wish.length}</b>}</button>
    <button className="user-pill" onClick={() => go('/account/profile')}><span className="user-avatar">{(profile.name || profile.phone || 'FN').slice(0, 2).toUpperCase()}</span><span>Account</span></button>
    <button className="cart-header" onClick={onCart}><ShoppingBasket /><span>Cart</span><b>{cartCount}</b></button>
    {menu && <nav className="mobile-nav" onClick={() => setMenu(false)}>{[['Home', '/'], ['Offers', '/offers'], ['All products', '/search?q='], ['My orders', '/account/orders'], ['Wishlist', '/account/wishlist'], ['Support', '/support']].map(([l, h]) => <button key={l} onClick={() => go(h)}>{l}</button>)}</nav>}
  </header>;
}
