import React, { lazy, Suspense, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { LogOut, Check } from 'lucide-react';
import { AppProvider, useApp, go } from './lib/store.jsx';
import { api } from './lib/api.js';
import { Header } from './components/Header.jsx';
import { LogoMark } from './components/Logo.jsx';
import { CartDrawer } from './components/CartDrawer.jsx';
import { LocationModal } from './components/LocationModal.jsx';
import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';
import Search from './pages/Search.jsx';
import Product from './pages/Product.jsx';
import Offers from './pages/Offers.jsx';
import Checkout from './pages/Checkout.jsx';
import Account from './pages/Account.jsx';
import Support from './pages/Support.jsx';
import Info, { INFO_LINKS } from './pages/Info.jsx';
import './style.css';
import './styles/extra.css';
import './styles/freshnest.css';

import { productById } from './data/products.js';
const Admin=lazy(()=>import('./pages/Admin.jsx'));
const Tracking=lazy(()=>import('./pages/Tracking.jsx').then(module=>({default:module.Tracking})));
const Confirmation=lazy(()=>import('./pages/Tracking.jsx').then(module=>({default:module.Confirmation})));

// Database catalogue is authoritative; local catalogue overrides are not applied.

function Shell() {
  const { route, toast, cartCount, authToken, setAuthToken, backendReady, syncError, sync, catalogVersion } = useApp();
  const [showCart, setShowCart] = useState(false); const [showLoc, setShowLoc] = useState(false); const [showLogout, setShowLogout] = useState(false);
  useEffect(() => {
    const product = route.parts[0] === 'product' ? productById[route.parts[1]] : null;
    const title = product ? product.name + ' | FreshNest' : 'FreshNest — Groceries at your doorstep';
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', product?.desc || 'Shop groceries and everyday essentials on FreshNest.');
  }, [route,catalogVersion]);
  const logout = async () => {
    try { await api('/auth/logout', { method: 'POST' }); } catch { /* Clear this browser even when the API is unavailable. */ }
    setAuthToken(null);
    setShowLogout(false);
    go('/');
  };
  const [section] = route.parts;
  const requiresSignIn = ['checkout','confirmed','track','account','support','admin','seller','delivery'].includes(section);
  if (!authToken && (requiresSignIn || section === 'login')) {
    return <Login onVerified={session => { setAuthToken(session.token); if (section === 'login') go(/^\/(?:product\/[\w-]+|$)/.test(route.params.next || '') ? route.params.next : '/'); }} />;
  }

  if (!backendReady) return <section className="day3-page"><div className="panel"><h2>{syncError ? 'FreshNest is temporarily unavailable' : 'Connecting to FreshNest…'}</h2><p>{syncError || 'Loading the FreshNest catalogue.'}</p>{syncError && <button className="primary" onClick={sync}>Retry</button>} {authToken && <button className="secondary" onClick={logout}>Log out</button>}</div></section>;
  const [a, b] = route.parts;
  let page;
  if (!a) page = <Home onLocation={() => setShowLoc(true)} />;
  else if (a === 'search') page = <Search />;
  else if (a === 'product') page = <Product id={b} />;
  else if (a === 'offers') page = <Offers />;
  else if (a === 'checkout') page = <Checkout />;
  else if (a === 'confirmed') page = <Confirmation id={b} />;
  else if (a === 'track') page = <Tracking id={b} />;
  else if (a === 'account') page = <Account section={b || 'profile'} onLogout={() => setShowLogout(true)} />;
  else if (a === 'support') page = <Support />;
  else if (a === 'info') page = <Info slug={b} />;
  else if (a === 'admin') page = <Admin key="admin" mode="admin" />;
  else if (a === 'seller') page = <Admin key="seller" mode="seller" />;
  else if (a === 'delivery') page = <Admin key="delivery" mode="delivery" />;
  else page = <section className="day3-page"><div className="empty-state"><h3>Page not found</h3><button className="primary" onClick={() => go('/')}>Go home</button></div></section>;

  return <>
    <Header onCart={() => setShowCart(true)} onLocation={() => setShowLoc(true)} />
    <main><Suspense fallback={<div className="day3-page" role="status">Loading…</div>}>{page}</Suspense></main>
    <footer className="site-footer"><div className="foot-top"><div className="footer-brand"><span className="brand-icon"><LogoMark size={26} /></span><b>FreshNest</b><p>From our farm to your home.</p></div>
      <nav className="foot-links">{INFO_LINKS.map(([l, s]) => <button key={s} onClick={() => go(`/info/${s}`)}>{l}</button>)}<button onClick={() => go('/support')}>FAQs</button></nav></div>
      <div className="foot-bottom"><span>© 2026 FreshNest</span></div></footer>
    {cartCount > 0 && route.parts[0] !== 'checkout' && !showCart && <button className="float-cart" onClick={() => setShowCart(true)}>View cart · {cartCount} item{cartCount > 1 ? 's' : ''}</button>}
    {showCart && <CartDrawer onClose={() => setShowCart(false)} />}
    {showLoc && <LocationModal onClose={() => setShowLoc(false)} />}
    {showLogout && <div className="overlay confirm-overlay" onMouseDown={e => e.target === e.currentTarget && setShowLogout(false)}><div className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="lo"><div className="confirm-icon"><LogOut /></div><h2 id="lo">Log out of FreshNest?</h2><p>You can sign in again with your email or Google account.</p><div className="confirm-actions"><button className="cancel-button" onClick={() => setShowLogout(false)}>Cancel</button><button className="logout-confirm" onClick={logout}>Yes, log out</button></div></div></div>}
    {toast && <div className="toast" role="status"><Check size={17} />{toast}</div>}
  </>;
}

createRoot(document.getElementById('root')).render(<AppProvider><Shell /></AppProvider>);

