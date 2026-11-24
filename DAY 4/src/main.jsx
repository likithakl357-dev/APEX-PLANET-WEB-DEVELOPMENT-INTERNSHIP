import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { LogOut, Check } from 'lucide-react';
import { AppProvider, useApp, go } from './lib/store.jsx';
import { save } from './lib/money.js';
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
import { Tracking, Confirmation } from './pages/Tracking.jsx';
import Account from './pages/Account.jsx';
import Support from './pages/Support.jsx';
import Info, { INFO_LINKS } from './pages/Info.jsx';
import Admin from './pages/Admin.jsx';
import './style.css';
import './styles/extra.css';
import './styles/freshnest.css';

// Database catalogue is authoritative; local catalogue overrides are not applied.

function Shell() {
  const { route, toast, cartCount, setProfile, authToken, setAuthToken, backendReady, syncError, sync } = useApp();
  const [verified, setVerified] = useState(() => Boolean(authToken));
  useEffect(() => { setVerified(Boolean(authToken)); }, [authToken]);
  const [showCart, setShowCart] = useState(false); const [showLoc, setShowLoc] = useState(false); const [showLogout, setShowLogout] = useState(false);
  useEffect(() => { document.title = 'FreshNest — Groceries at your doorstep'; }, []);
  const logout = () => { setAuthToken(null); setVerified(false); save('fn_verified', false); setShowLogout(false); };
  if (!verified) return <Login onVerified={(phone, session) => { setProfile(p => ({ ...p, phone, name: session?.user?.name || p.name })); setAuthToken(session.token); save('fn_verified', true); setVerified(true); }} />;

  if (!backendReady) return <section className="day3-page"><div className="panel"><h2>{syncError ? 'FreshNest is temporarily unavailable' : 'Connecting to FreshNest…'}</h2><p>{syncError || 'Loading your account and catalogue.'}</p>{syncError && <button className="primary" onClick={sync}>Retry</button>} <button className="secondary" onClick={logout}>Log out</button></div></section>;
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
    <main>{page}</main>
    <footer className="site-footer"><div className="foot-top"><div className="footer-brand"><span className="brand-icon"><LogoMark size={26} /></span><b>FreshNest</b><p>From our farm to your home.</p></div>
      <nav className="foot-links">{INFO_LINKS.map(([l, s]) => <button key={s} onClick={() => go(`/info/${s}`)}>{l}</button>)}<button onClick={() => go('/support')}>FAQs</button></nav></div>
      <div className="foot-bottom"><span>© 2026 FreshNest</span></div></footer>
    {cartCount > 0 && route.parts[0] !== 'checkout' && !showCart && <button className="float-cart" onClick={() => setShowCart(true)}>View cart · {cartCount} item{cartCount > 1 ? 's' : ''}</button>}
    {showCart && <CartDrawer onClose={() => setShowCart(false)} />}
    {showLoc && <LocationModal onClose={() => setShowLoc(false)} />}
    {showLogout && <div className="overlay confirm-overlay" onMouseDown={e => e.target === e.currentTarget && setShowLogout(false)}><div className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="lo"><div className="confirm-icon"><LogOut /></div><h2 id="lo">Log out of FreshNest?</h2><p>You will need to verify your mobile number again to continue shopping.</p><div className="confirm-actions"><button className="cancel-button" onClick={() => setShowLogout(false)}>Cancel</button><button className="logout-confirm" onClick={logout}>Yes, log out</button></div></div></div>}
    {toast && <div className="toast" role="status"><Check size={17} />{toast}</div>}
  </>;
}

createRoot(document.getElementById('root')).render(<AppProvider><Shell /></AppProvider>);
