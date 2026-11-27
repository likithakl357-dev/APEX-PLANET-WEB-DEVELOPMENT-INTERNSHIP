import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, useRef } from 'react';
import { load, save } from './money.js';
import { productById, applyServerCatalog } from '../data/products.js';
import { ORDER_STAGES, CANCEL_ALLOWED_BEFORE_STAGE, FEES } from '../data/config.js';
import { api, getToken, setToken } from './api.js';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

// ---- tiny hash router: #/path/segments?x=y ----
export const parseHash = () => {
  const raw = window.location.hash.replace(/^#/, '') || window.location.pathname || '/';
  const [path, qs] = raw.split('?');
  return { parts: path.split('/').filter(Boolean), params: Object.fromEntries(new URLSearchParams(qs || '')) };
};
export const go = to => { window.location.hash = to; window.scrollTo({ top: 0 }); };

// Stage is derived from elapsed time so tracking is deterministic and survives refresh. DEMO: 12s per stage.
export const STAGE_MS = 12000;
export const stageOf = o => { if (!o.demo) return ({ pending: 0, confirmed: 1, processing: 2, packed: o.assignment ? 4 : 3, out_for_delivery: 5, delivered: 6, cancelled: -1, returned: -1 }[String(o.status).toLowerCase()] ?? 0); return o.status === 'cancelled' ? -1 : Math.min(ORDER_STAGES.length - 1, Math.floor((Date.now() - o.createdAt) / STAGE_MS)); };
export const canCancel = o => o.demo ? o.status !== 'cancelled' && stageOf(o) < CANCEL_ALLOWED_BEFORE_STAGE : (o.paymentMethod !== 'RAZORPAY' || o.paymentStatus === 'PAID') && ['pending', 'confirmed'].includes(String(o.status).toLowerCase());

const persisted = (key, fb) => () => load(key, fb);
const mapAddress=x=>({id:x.id,type:x.label,text:[x.line1,x.line2,x.landmark].filter(Boolean).join(', '),city:x.city,state:x.state,pin:x.pin,instructions:x.instructions||'',isDefault:x.isDefault,recipient:x.recipient,phone:x.phone,lat:x.latitude,lon:x.longitude});
const mapOrder=x=>{const a=x.addressSnapshot||x.address||{};return {id:x.orderNumber,backendId:x.id,createdAt:new Date(x.createdAt).getTime(),date:new Date(x.createdAt).toLocaleString('en-IN'),status:String(x.status).toLowerCase(),total:x.total,tip:x.tip||0,payment:({COD:'Cash on Delivery',UPI:'UPI (demo)',CARD:'Card (demo)',NETBANKING:'Net banking (demo)',WALLET:'Wallet (demo)',RAZORPAY:'Razorpay online payment'})[x.paymentMethod],paymentMethod:x.paymentMethod,paymentStatus:x.paymentStatus,items:(x.items||[]).map(i=>({id:i.productId,name:i.productName,qty:i.quantity,price:i.unitPrice})),address:[a.line1,a.line2,a.city,a.state,a.pin].filter(Boolean).join(', '),destination:{latitude:a.latitude,longitude:a.longitude},deliveryEstimate:x.checkoutDetails?.deliveryEstimate,bill:{subtotal:x.subtotal,couponDiscount:x.discount,delivery:x.deliveryFee,handling:x.handlingFee,smallCart:x.smallCartFee||0,giftFee:x.giftFee||0,tip:x.tip||0},coupon:x.couponCode,slot:x.checkoutDetails?.slot||'Not recorded',sellerOrders:x.sellerOrders||[],assignment:x.deliveryAssignment,history:x.statusHistory||[],returns:x.returns||[],refunds:x.refunds||[],demo:false};};
export function AppProvider({ children }) {
  const [route,setRoute]=useState(parseHash);
  useEffect(()=>{for(const k of ['fn_cart','fn_wish','fn_orders','fn_addresses','fn_profile','fn_tickets','fn_role','fn_sel_addr'])localStorage.removeItem(k);},[]);
  const [authToken,setAuthTokenState]=useState(()=>getToken());
  const [authUser,setAuthUser]=useState(null);
  const [backendReady,setBackendReady]=useState(false);
  const [configuration,setConfiguration]=useState({ fees: FEES, serviceAreas: [] });
  const refreshConfig=useCallback(async()=>setConfiguration(await api('/config')),[]);
  const [syncError,setSyncError]=useState('');
  const [cart,setCart]=useState(() => getToken() ? {} : load('fn_guest_cart',{}).items || {}); const [wish,setWish]=useState([]); const [orders,setOrders]=useState([]); const [addresses,setAddresses]=useState([]);
  const [selectedAddrId,setSelectedAddrId]=useState('');
  const [guestPin,setGuestPin]=useState(() => load('fn_delivery_pin',''));
  const selectGuestPin = pin => { setGuestPin(pin); save('fn_delivery_pin',pin); };
  const [recent,setRecent]=useState(persisted('fn_recent',[])); const [recentSearches,setRecentSearches]=useState(persisted('fn_recent_searches',[]));
  const [tickets,setTickets]=useState([]); const [profile,setProfile]=useState({name:'',email:'',phone:''});
  const [gst,setGst]=useState(persisted('fn_gst_details',{business:'',gstin:'',billing:''}));
  const [notif,setNotif]=useState(persisted('fn_notif',{orders:true,offers:true,promo:false,account:true}));
  const [alerts,setAlerts]=useState(persisted('fn_alerts',{priceDrop:[],backInStock:[]}));
  const [savedCoupons,setSavedCoupons]=useState(persisted('fn_saved_coupons',[])); const [subPref,setSubPref]=useState(persisted('fn_sub_pref','replace'));
  const [toast,setToast]=useState(''); const [catalogVersion,setCatalogVersion]=useState(0);
  const notify=useCallback(m=>{setToast(m);clearTimeout(notify.t);notify.t=setTimeout(()=>setToast(''),3500);},[]);
  const queue=useRef(Promise.resolve()); const session=useRef(authToken); const busy=useRef(false);
  const cartRef=useRef(cart); const wishRef=useRef([]);
  const applyCart=rows=>{const c=Object.fromEntries(rows.items.map(i=>[i.productId,i.quantity]));cartRef.current=c;setCart(c);};
  const applyWish=rows=>{wishRef.current=rows.items;setWish(rows.items);};
  const setAuthToken=token=>{session.current=token;setToken(token);setAuthTokenState(token);setBackendReady(false);setAuthUser(null);const initialCart=token?{}:(load('fn_guest_cart',{}).items||{});cartRef.current=initialCart;wishRef.current=[];setCart(initialCart);setWish([]);setOrders([]);setAddresses([]);setTickets([]);setProfile({name:'',email:'',phone:''});setSelectedAddrId('');};
  useEffect(()=>{const f=()=>setRoute(parseHash());window.addEventListener('hashchange',f);return()=>window.removeEventListener('hashchange',f);},[]);
  const refreshCatalog=useCallback(async()=>{const all=[];let page=1,r;do{r=await api(`/products?limit=500&page=${page++}`);all.push(...r.items);}while(page<=r.pages);applyServerCatalog(all);setCatalogVersion(v=>v+1);},[]);
  const refreshOrders=useCallback(async()=>{const token=session.current;if(!token)return;const rows=await api('/orders');if(session.current===token)setOrders(rows.map(mapOrder));},[]);
  const refreshUser=useCallback(async()=>{const token=session.current;const {user}=await api('/auth/me');if(session.current===token){setAuthUser(user);setProfile({name:user.name||'',email:user.email||'',phone:user.phone});}return user;},[]);
  const refreshAddresses=async()=>{const rows=(await api('/addresses')).map(mapAddress);setAddresses(rows);setSelectedAddrId(id=>rows.some(a=>a.id===id)?id:rows.find(a=>a.isDefault)?.id||rows[0]?.id||'');return rows;};
  const sync=useCallback(async()=>{const token=session.current;setSyncError('');try{
    if (!token) { await Promise.all([refreshCatalog(),refreshConfig()]); if (!session.current) setBackendReady(true); return; }
    const guest = load('fn_guest_cart', {});
    if (guest.id && Object.keys(guest.items || {}).length) {
      await api('/cart/merge', {method:'POST',body:{mergeId:guest.id,items:Object.entries(guest.items).map(([productId,quantity])=>({productId,quantity}))}});
      if (session.current !== token) return;
      save('fn_guest_cart', {});
    }
    const [me,c,w,a,o]=await Promise.all([api('/auth/me'),api('/cart'),api('/wishlist'),api('/addresses'),api('/orders'),refreshCatalog(),refreshConfig()]);if(session.current!==token)return;setAuthUser(me.user);setProfile({name:me.user.name||'',email:me.user.email||'',phone:me.user.phone});applyCart(c);applyWish(w);const rows=a.map(mapAddress);setAddresses(rows);setSelectedAddrId(rows.find(x=>x.isDefault)?.id||rows[0]?.id||'');setOrders(o.map(mapOrder));setBackendReady(true);}catch(e){if(session.current!==token)return;if(e.status===401)setAuthToken(null);else setSyncError(e.message);}},[refreshCatalog,refreshConfig]);
  useEffect(()=>{sync();},[authToken,sync]);
  useEffect(()=>{if(!backendReady)return;const t=setInterval(()=>{refreshOrders().catch(()=>{});},15000);const focus=()=>{refreshCatalog().catch(()=>{});if(session.current)refreshUser().catch(()=>{});};window.addEventListener('focus',focus);return()=>{clearInterval(t);window.removeEventListener('focus',focus);};},[backendReady,refreshOrders,refreshCatalog,refreshUser]);
  useEffect(()=>save('fn_recent',recent),[recent]);useEffect(()=>save('fn_recent_searches',recentSearches),[recentSearches]);useEffect(()=>save('fn_gst_details',gst),[gst]);useEffect(()=>save('fn_notif',notif),[notif]);useEffect(()=>save('fn_alerts',alerts),[alerts]);useEffect(()=>save('fn_saved_coupons',savedCoupons),[savedCoupons]);useEffect(()=>save('fn_sub_pref',subPref),[subPref]);
  const enqueue=fn=>{const token=session.current;const next=queue.current.catch(()=>{}).then(()=>{if(!token||session.current!==token||!backendReady)throw new Error('Please wait for database synchronization.');return fn(token);});queue.current=next.catch(()=>{});return next;};
  const writeGuestCart = (id, delta) => {
    const stock = productById[id]?.stock || 0;
    const previous = cartRef.current[id] || 0;
    if (delta > 0 && previous >= Math.min(20, stock)) return notify('No more stock available.');
    const quantity = delta === null ? 0 : Math.max(0, Math.min(previous + delta, 20, stock));
    const items = {...cartRef.current};
    if (quantity) items[id] = quantity; else delete items[id];
    cartRef.current = items;
    setCart(items);
    save('fn_guest_cart', { id: crypto.randomUUID(), items });
  };
  const changeQty=(id,delta)=>{if(!session.current)return writeGuestCart(id,delta);if(busy.current)return;return enqueue(async token=>{const p=productById[id],before=cartRef.current[id]||0;if(delta>0&&(!p||p.stock<=before))throw new Error('No more stock available.');const quantity=Math.max(0,Math.min(before+delta,20));await api(`/cart/items/${encodeURIComponent(id)}`,{method:'PUT',body:{quantity}});if(session.current===token)applyCart(await api('/cart'));}).catch(e=>notify(e.message));};
  const removeFromCart=id=>{if(!session.current)return writeGuestCart(id,null);if(busy.current)return;return enqueue(async token=>{await api(`/cart/items/${encodeURIComponent(id)}`,{method:'DELETE'});if(session.current===token)applyCart(await api('/cart'));}).catch(e=>notify(e.message));};
  const toggleWish=id=>!session.current ? go('/account/wishlist') : enqueue(async token=>{await api(`/wishlist/${encodeURIComponent(id)}`,{method:'PUT',body:{saved:!wishRef.current.includes(id)}});if(session.current===token)applyWish(await api('/wishlist'));}).catch(e=>notify(e.message));
  const viewProduct = id => setRecent(r => [id, ...r.filter(x => x !== id)].slice(0, 12));
  const addSearch = q => { const t = q.trim(); if (t) setRecentSearches(r => [t, ...r.filter(x => x.toLowerCase() !== t.toLowerCase())].slice(0, 6)); };

  const selectedAddress = addresses.find(a => a.id === selectedAddrId) || addresses.find(a => a.isDefault) || addresses[0] || null;
  const upsertAddress=async a=>{const payload={label:a.type||'Home',line1:a.text.trim(),city:a.city.trim(),state:a.state.trim(),pin:a.pin,instructions:a.instructions||'',isDefault:!!a.isDefault,...(a.recipient?{recipient:a.recipient}:{}),...(a.phone?{phone:a.phone}:{}),...(Number.isFinite(a.lat)?{latitude:a.lat}:{}),...(Number.isFinite(a.lon)?{longitude:a.lon}:{})};const existing=addresses.some(x=>x.id===a.id);const saved=await api(existing?`/addresses/${a.id}`:'/addresses',{method:existing?'PUT':'POST',body:payload});await refreshAddresses();if(saved.isDefault)setSelectedAddrId(saved.id);return mapAddress(saved);};
  const deleteAddress=async id=>{await api(`/addresses/${id}`,{method:'DELETE'});await refreshAddresses();};
  const placeOrder=async data=>{if(busy.current)throw new Error('Order submission in progress.');busy.current=true;try{return await enqueue(async token=>{if(!selectedAddress)throw new Error('Please add a delivery address.');const order=await api('/orders',{method:'POST',body:{addressId:selectedAddress.id,paymentMethod:data.paymentMethod,expectedTotal:data.expectedTotal,idempotencyKey:data.key,couponCode:data.coupon||undefined,customerNote:data.note||undefined,gift:!!data.gift,tip:Math.round(data.tip||0),checkoutDetails:{slot:data.slot,giftTo:data.giftTo,giftMsg:data.giftMsg,substitution:data.substitution}}});const mapped=mapOrder(order);if(session.current===token){setOrders(o=>[mapped,...o.filter(x=>x.id!==mapped.id)]);applyCart({items:[]});refreshCatalog().catch(()=>{});}return mapped;});}finally{busy.current=false;}};
  const updateOrder=async(id,patch)=>{if(patch.status!=='cancelled')throw new Error('Unsupported customer order update.');await api(`/orders/${encodeURIComponent(id)}/cancel`,{method:'POST',body:{reason:patch.cancelReason}});await refreshOrders();await refreshCatalog();};
  const reorder=async order=>{let added=0,skipped=0;await enqueue(async token=>{for(const it of order.items){const p=productById[it.id];const before=cartRef.current[it.id]||0;const quantity=Math.min(before+it.qty,p?.stock||0,20);if(quantity<=before){skipped++;continue;}try{await api(`/cart/items/${encodeURIComponent(it.id)}`,{method:'PUT',body:{quantity}});added++;}catch{skipped++;}}if(session.current===token)applyCart(await api('/cart'));});return {added,skipped};};
  const role=authUser?.role?.toLowerCase()||'customer';
  const value={route,cart,wish,orders,addresses,recent,recentSearches,tickets,setTickets,profile,setProfile,gst,setGst,notif,setNotif,authToken,setAuthToken,authUser,backendReady,syncError,sync,refreshUser,refreshCatalog,catalogVersion,alerts,setAlerts,savedCoupons,setSavedCoupons,subPref,setSubPref,configuration,refreshConfig,selectedAddress,setSelectedAddrId,guestPin,selectGuestPin,role,toast,notify,changeQty,removeFromCart,toggleWish,viewProduct,addSearch,setRecentSearches,upsertAddress,deleteAddress,placeOrder,updateOrder,refreshOrders,reorder,cartCount:Object.values(cart).reduce((a,b)=>a+b,0)};
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
