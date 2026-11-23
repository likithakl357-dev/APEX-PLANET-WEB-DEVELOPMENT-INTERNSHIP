import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { load, save } from './money.js';
import { productById } from '../data/products.js';
import { ORDER_STAGES, CANCEL_ALLOWED_BEFORE_STAGE } from '../data/config.js';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

// ---- tiny hash router: #/path/segments?x=y ----
export const parseHash = () => {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  const [path, qs] = raw.split('?');
  return { parts: path.split('/').filter(Boolean), params: Object.fromEntries(new URLSearchParams(qs || '')) };
};
export const go = to => { window.location.hash = to; window.scrollTo({ top: 0 }); };

// Stage is derived from elapsed time so tracking is deterministic and survives refresh. DEMO: 12s per stage.
export const STAGE_MS = 12000;
export const stageOf = o => o.status === 'cancelled' ? -1 : Math.min(ORDER_STAGES.length - 1, Math.floor((Date.now() - o.createdAt) / STAGE_MS));
export const canCancel = o => o.status !== 'cancelled' && stageOf(o) < CANCEL_ALLOWED_BEFORE_STAGE;

const persisted = (key, fb) => () => load(key, fb);
const DEFAULT_ADDR = [{ id: 'a1', type: 'Home', text: '12, Sample Street, Adyar, Chennai', pin: '600020', instructions: '', isDefault: true }];

export function AppProvider({ children }) {
  const [route, setRoute] = useState(parseHash);
  useEffect(() => { const f = () => setRoute(parseHash()); window.addEventListener('hashchange', f); return () => window.removeEventListener('hashchange', f); }, []);

  const [cart, setCart] = useState(persisted('fn_cart', {}));
  const [wish, setWish] = useState(persisted('fn_wish', []));
  const [orders, setOrders] = useState(persisted('fn_orders', []));
  const [addresses, setAddresses] = useState(persisted('fn_addresses', DEFAULT_ADDR));
  const [recent, setRecent] = useState(persisted('fn_recent', []));
  const [recentSearches, setRecentSearches] = useState(persisted('fn_recent_searches', []));
  const [tickets, setTickets] = useState(persisted('fn_tickets', []));
  const [profile, setProfile] = useState(persisted('fn_profile', { name: '', email: '', phone: '' }));
  const [gst, setGst] = useState(persisted('fn_gst_details', { business: '', gstin: '', billing: '' }));
  const [notif, setNotif] = useState(persisted('fn_notif', { orders: true, offers: true, promo: false, account: true }));
  const [alerts, setAlerts] = useState(persisted('fn_alerts', { priceDrop: [], backInStock: [] }));
  const [savedCoupons, setSavedCoupons] = useState(persisted('fn_saved_coupons', []));
  const [subPref, setSubPref] = useState(persisted('fn_sub_pref', 'replace'));
  const [selectedAddrId, setSelectedAddrId] = useState(persisted('fn_sel_addr', 'a1'));
  const [role, setRole] = useState(persisted('fn_role', 'customer')); // DEMO role switch only, not security
  const [toast, setToast] = useState('');

  useEffect(() => save('fn_cart', cart), [cart]); useEffect(() => save('fn_wish', wish), [wish]);
  useEffect(() => save('fn_orders', orders), [orders]); useEffect(() => save('fn_addresses', addresses), [addresses]);
  useEffect(() => save('fn_recent', recent), [recent]); useEffect(() => save('fn_recent_searches', recentSearches), [recentSearches]);
  useEffect(() => save('fn_tickets', tickets), [tickets]); useEffect(() => save('fn_profile', profile), [profile]);
  useEffect(() => save('fn_gst_details', gst), [gst]); useEffect(() => save('fn_notif', notif), [notif]);
  useEffect(() => save('fn_alerts', alerts), [alerts]); useEffect(() => save('fn_saved_coupons', savedCoupons), [savedCoupons]);
  useEffect(() => save('fn_sub_pref', subPref), [subPref]); useEffect(() => save('fn_sel_addr', selectedAddrId), [selectedAddrId]);
  useEffect(() => save('fn_role', role), [role]);

  const notify = useCallback(m => { setToast(m); clearTimeout(notify.t); notify.t = setTimeout(() => setToast(''), 2400); }, []);

  const changeQty = useCallback((id, delta) => {
    const p = productById[id]; if (!p) return;
    if (p.stock === 0 && delta > 0) { notify('This item is out of stock'); return; }
    setCart(old => {
      const next = { ...old }; const n = (next[id] || 0) + delta;
      if (n <= 0) delete next[id]; else next[id] = Math.min(n, p.stock, 20); // invalid quantities prevented
      return next;
    });
  }, [notify]);
  const removeFromCart = id => setCart(c => { const n = { ...c }; delete n[id]; return n; });
  const toggleWish = id => setWish(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id]);
  const viewProduct = id => setRecent(r => [id, ...r.filter(x => x !== id)].slice(0, 12));
  const addSearch = q => { const t = q.trim(); if (t) setRecentSearches(r => [t, ...r.filter(x => x.toLowerCase() !== t.toLowerCase())].slice(0, 6)); };

  const selectedAddress = addresses.find(a => a.id === selectedAddrId) || addresses.find(a => a.isDefault) || addresses[0] || null;
  const upsertAddress = a => setAddresses(list => {
    let next = list.some(x => x.id === a.id) ? list.map(x => x.id === a.id ? a : x) : [...list, a];
    if (a.isDefault || next.length === 1) next = next.map(x => ({ ...x, isDefault: x.id === a.id || (next.length === 1) }));
    return next;
  });
  const deleteAddress = id => setAddresses(list => { const next = list.filter(x => x.id !== id); if (next.length && !next.some(x => x.isDefault)) next[0] = { ...next[0], isDefault: true }; return next; });

  const placeOrder = data => {
    const order = { ...data, id: `FN${Date.now().toString().slice(-8)}`, createdAt: Date.now(), status: 'active', demo: true };
    setOrders(o => [order, ...o]); setCart({}); return order;
  };
  const updateOrder = (id, patch) => setOrders(o => o.map(x => x.id === id ? { ...x, ...patch } : x));
  const reorder = order => {
    let added = 0, skipped = 0;
    setCart(c => { const n = { ...c }; order.items.forEach(it => { const p = productById[it.id]; if (!p || p.stock === 0) { skipped++; return; } n[it.id] = Math.min((n[it.id] || 0) + it.qty, p.stock, 20); added++; }); return n; });
    return { added, skipped };
  };

  const value = useMemo(() => ({
    route, cart, setCart, wish, orders, addresses, recent, recentSearches, tickets, setTickets, profile, setProfile, gst, setGst, notif, setNotif,
    alerts, setAlerts, savedCoupons, setSavedCoupons, subPref, setSubPref, selectedAddress, setSelectedAddrId, role, setRole, toast,
    notify, changeQty, removeFromCart, toggleWish, viewProduct, addSearch, setRecentSearches, upsertAddress, deleteAddress, placeOrder, updateOrder, reorder, setOrders,
    cartCount: Object.values(cart).reduce((a, b) => a + b, 0),
  }), [route, cart, wish, orders, addresses, recent, recentSearches, tickets, profile, gst, notif, alerts, savedCoupons, subPref, selectedAddress, role, toast]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
