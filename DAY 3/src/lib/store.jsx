import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { load, save } from './money.js';
import { productById, applyServerCatalog } from '../data/products.js';
import { ORDER_STAGES, CANCEL_ALLOWED_BEFORE_STAGE } from '../data/config.js';
import { api, getToken, setToken } from './api.js';

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
export const stageOf = o => { if (!o.demo) return ({ pending: 0, confirmed: 1, processing: 2, packed: 3, out_for_delivery: 5, delivered: 6, cancelled: -1, returned: -1 }[String(o.status).toLowerCase()] ?? 0); return o.status === 'cancelled' ? -1 : Math.min(ORDER_STAGES.length - 1, Math.floor((Date.now() - o.createdAt) / STAGE_MS)); };
export const canCancel = o => o.demo ? o.status !== 'cancelled' && stageOf(o) < CANCEL_ALLOWED_BEFORE_STAGE : ['pending', 'confirmed'].includes(String(o.status).toLowerCase());

const persisted = (key, fb) => () => load(key, fb);
const DEFAULT_ADDR = [{ id: 'a1', type: 'Home', text: '12, Sample Street, Adyar, Chennai', pin: '600020', instructions: '', isDefault: true }];

export function AppProvider({ children }) {
  const [route, setRoute] = useState(parseHash);
  const [authToken, setAuthTokenState] = useState(() => getToken());
  const [authUser, setAuthUser] = useState(null);
  const setAuthToken = token => { setToken(token); setAuthTokenState(token); };
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
  const [backendReady, setBackendReady] = useState(false);

  useEffect(() => {
    if (!authToken) { setBackendReady(false); setAuthUser(null); return; }
    let live = true;
    (async () => {
      try {
        const [me, c, w, a, o, catalog] = await Promise.all([api('/auth/me'), api('/cart'), api('/wishlist'), api('/addresses'), api('/orders'), api('/products?limit=400')]);
        if (!live) return;
        setAuthUser(me.user); applyServerCatalog(catalog.items); setCart(Object.fromEntries(c.items.map(i => [i.productId, i.quantity]))); setWish(w.items);
        const mapped = a.map(x => ({ id: x.id, type: x.label, text: [x.line1, x.line2, x.landmark].filter(Boolean).join(', '), city: x.city, state: x.state, pin: x.pin, instructions: x.instructions || '', isDefault: x.isDefault, recipient: x.recipient, phone: x.phone }));
        setAddresses(mapped); setSelectedAddrId(mapped.find(x => x.isDefault)?.id || mapped[0]?.id || '');
        setOrders(o.map(x => ({ id: x.orderNumber, backendId: x.id, createdAt: new Date(x.createdAt).getTime(), status: String(x.status).toLowerCase(), total: x.total, tip: x.tip || 0, payment: x.paymentMethod, paymentStatus: x.paymentStatus, items: x.items.map(i => ({ id: i.productId, name: i.productName, qty: i.quantity, price: i.unitPrice })), address: `${x.address.line1}, ${x.address.city}, ${x.address.state} ${x.address.pin}`, bill: { subtotal: x.subtotal, couponDiscount: x.discount, delivery: x.deliveryFee, handling: x.handlingFee, smallCart: x.smallCartFee || 0, giftFee: x.giftFee || 0, tip: x.tip || 0 } })));
        setBackendReady(true);
      } catch (e) { if (e.status === 401) setAuthToken(null); else notify(`Backend sync: ${e.message}`); }
    })();
    return () => { live = false; };
  }, [authToken]);

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
    const before = cart[id] || 0;
    if (p.stock === 0 && delta > 0) { notify('This item is out of stock'); return; }
    const quantity = Math.max(0, Math.min(before + delta, p.stock, 20));
    setCart(old => { const next = { ...old }; if (quantity <= 0) delete next[id]; else next[id] = quantity; return next; });
    if (authToken) api(`/cart/items/${encodeURIComponent(id)}`, { method: 'PUT', body: { quantity } }).catch(e => {
      setCart(old => { if ((old[id] || 0) !== quantity) return old; const next = { ...old }; if (before) next[id] = before; else delete next[id]; return next; }); notify(e.message);
    });
  }, [notify, authToken, cart]);
  const removeFromCart = id => { setCart(c => { const n = { ...c }; delete n[id]; return n; }); if (authToken) api(`/cart/items/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(e => notify(e.message)); };
  const toggleWish = id => { setWish(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id]); if (authToken) api(`/wishlist/${encodeURIComponent(id)}`, { method: 'PUT' }).catch(e => notify(e.message)); };
  const viewProduct = id => setRecent(r => [id, ...r.filter(x => x !== id)].slice(0, 12));
  const addSearch = q => { const t = q.trim(); if (t) setRecentSearches(r => [t, ...r.filter(x => x.toLowerCase() !== t.toLowerCase())].slice(0, 6)); };

  const selectedAddress = addresses.find(a => a.id === selectedAddrId) || addresses.find(a => a.isDefault) || addresses[0] || null;
  const upsertAddress = async a => {
    if (!authToken) {
      setAddresses(list => { let next = list.some(x => x.id === a.id) ? list.map(x => x.id === a.id ? a : x) : [...list, a]; if (a.isDefault || next.length === 1) next = next.map(x => ({ ...x, isDefault: x.id === a.id || next.length === 1 })); return next; });
      return a;
    }
    const payload = { label: a.type || 'Home', line1: a.text.trim(), city: (a.city || '').trim(), state: (a.state || '').trim(), pin: a.pin, instructions: a.instructions || '', isDefault: !!a.isDefault };
    const saved = a.id && !String(a.id).startsWith('a')
      ? await api(`/addresses/${a.id}`, { method: 'PUT', body: payload })
      : await api('/addresses', { method: 'POST', body: payload });
    const mapped = { id: saved.id, type: saved.label, text: saved.line1, city: saved.city, state: saved.state, pin: saved.pin, instructions: saved.instructions || '', isDefault: saved.isDefault };
    setAddresses(list => [...list.filter(v => v.id !== mapped.id), mapped]);
    if (mapped.isDefault || !selectedAddrId) setSelectedAddrId(mapped.id);
    return mapped;
  };
  const deleteAddress = id => { setAddresses(list => { const next = list.filter(x => x.id !== id); if (next.length && !next.some(x => x.isDefault)) next[0] = { ...next[0], isDefault: true }; return next; }); if (authToken) api(`/addresses/${id}`, { method: 'DELETE' }).catch(e => notify(e.message)); };

  const placeOrder = async data => {
    if (authToken) {
      const saved = addresses.find(x => x.id === selectedAddrId) || selectedAddress;
      if (!saved) throw new Error('Please add a delivery address.');
      const order = await api('/orders', { method: 'POST', body: { addressId: saved.id, paymentMethod: data.payment === 'Cash on Delivery' ? 'COD' : data.payment === 'UPI' ? 'UPI' : data.payment === 'Card' ? 'CARD' : 'NETBANKING', couponCode: data.coupon || undefined, customerNote: data.note || undefined, gift: !!data.gift, tip: Math.round(data.tip || 0) } });
      const mapped = { ...data, id: order.orderNumber, backendId: order.id, createdAt: new Date(order.createdAt).getTime(), status: 'pending', total: order.total, paymentStatus: order.paymentStatus, items: order.items.map(i => ({ id: i.productId, name: i.productName, qty: i.quantity, price: i.unitPrice })), address: `${order.address.line1}, ${order.address.city}, ${order.address.state} ${order.address.pin}`, demo: false };
      setOrders(o => [mapped, ...o]); setCart({}); return mapped;
    }
    const order = { ...data, id: `FN${Date.now().toString().slice(-8)}`, createdAt: Date.now(), status: 'active', demo: true }; setOrders(o => [order, ...o]); setCart({}); return order;
  };
  const refreshOrders = useCallback(async () => {
    if (!authToken) return;
    const rows = await api('/orders');
    setOrders(rows.map(x => ({ id: x.orderNumber, backendId: x.id, createdAt: new Date(x.createdAt).getTime(), status: String(x.status).toLowerCase(), total: x.total, tip: x.tip || 0, payment: x.paymentMethod, paymentStatus: x.paymentStatus, items: x.items.map(i => ({ id: i.productId, name: i.productName, qty: i.quantity, price: i.unitPrice })), address: `${x.address.line1}, ${x.address.city}, ${x.address.state} ${x.address.pin}`, bill: { subtotal: x.subtotal, couponDiscount: x.discount, delivery: x.deliveryFee, handling: x.handlingFee, smallCart: x.smallCartFee || 0, giftFee: x.giftFee || 0, tip: x.tip || 0 } })));
  }, [authToken]);
  const updateOrder = async (id, patch) => {
    if (authToken && patch.status === 'cancelled') { const result = await api(`/orders/${encodeURIComponent(id)}/cancel`, { method: 'POST', body: {} }); setOrders(o => o.map(x => x.id === id ? { ...x, status: 'cancelled', cancelReason: patch.cancelReason } : x)); return result; }
    setOrders(o => o.map(x => x.id === id ? { ...x, ...patch } : x));
  };
  const reorder = order => {
    let added = 0, skipped = 0;
    setCart(c => { const n = { ...c }; order.items.forEach(it => { const p = productById[it.id]; if (!p || p.stock === 0) { skipped++; return; } n[it.id] = Math.min((n[it.id] || 0) + it.qty, p.stock, 20); added++; }); return n; });
    return { added, skipped };
  };

  const value = useMemo(() => ({
    route, cart, setCart, wish, orders, addresses, recent, recentSearches, tickets, setTickets, profile, setProfile, gst, setGst, notif, setNotif, authToken, setAuthToken, authUser, backendReady,
    alerts, setAlerts, savedCoupons, setSavedCoupons, subPref, setSubPref, selectedAddress, setSelectedAddrId, role, setRole, toast,
    notify, changeQty, removeFromCart, toggleWish, viewProduct, addSearch, setRecentSearches, upsertAddress, deleteAddress, placeOrder, updateOrder, refreshOrders, reorder, setOrders,
    cartCount: Object.values(cart).reduce((a, b) => a + b, 0),
  }), [route, cart, wish, orders, addresses, recent, recentSearches, tickets, profile, gst, notif, alerts, savedCoupons, subPref, selectedAddress, role, toast, authToken, authUser, backendReady]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
