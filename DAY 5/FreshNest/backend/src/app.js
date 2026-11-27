import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { randomUUID, randomInt } from 'node:crypto';
import { prisma } from './db.js';
import { auth, roles } from './middleware/auth.js';
import { asyncHandler, publicProduct } from './utils/http.js';
import { calculateOrderTotals } from './utils/pricing.js';

import { registerEmailAuth } from './emailAuth.js';
import { razorpayReady, razorpayWebhook, registerRazorpay } from './razorpay.js';

export const app = express();

app.use(helmet());
app.use(cors({ origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(s => s.trim()), credentials: true }));
// FRESHNEST_LOCATION_FIX
app.get('/api/reverse-geocode', rateLimit({ windowMs: 60000, limit: 20 }), async (req,res)=>{
  const lat=Number(req.query.lat),lon=Number(req.query.lon);
  if(typeof req.query.lat!=='string'||typeof req.query.lon!=='string'||!req.query.lat.trim()||!req.query.lon.trim()||!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)return res.status(400).json({error:'Invalid coordinates'});
  res.set('Cache-Control','no-store');
  const key=process.env.GEOAPIFY_API_KEY;
  if(!key)return res.status(503).json({error:'Geoapify is not configured'});
  try {
    const url=new URL('https://api.geoapify.com/v1/geocode/reverse');
    url.search=new URLSearchParams({lat:String(lat),lon:String(lon),format:'json',lang:'en',apiKey:key}).toString();
    const response=await fetch(url,{signal:AbortSignal.timeout(8000)});
    if(!response.ok){console.error('Geoapify HTTP status:',response.status);return res.status(502).json({error:'Address provider request failed'});}
    const data=await response.json();const a=data.results?.[0];
    if(!a?.formatted)return res.status(404).json({error:'Address not found'});
    return res.json({text:a.formatted,pin:a.postcode||'',city:a.city||a.town||a.village||a.county||'',state:a.state||'',country:a.country||'',countryCode:a.country_code||''});
  }catch(e){console.error('Geoapify lookup failed:',e.name);return res.status(502).json({error:'Address lookup failed'});}
});

app.post('/api/webhooks/razorpay', express.raw({ type: 'application/json', limit: '128kb' }), razorpayWebhook);
app.use(express.json({ limit: '1mb' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false }));
const parse = (schema, data) => { const r = schema.safeParse(data); if (!r.success) { const e = new Error(r.error.issues.map(x => x.message).join(' ')); e.status = 400; throw e; } return r.data; };
const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number.');
import { deliveryEstimate } from './deliveryEstimate.js';
import { registerDeliveryConfig, settings } from './deliveryConfig.js';
import { registerDispatch } from './dispatch.js';
import { registerDeliveryProof } from './deliveryProof.js';
import { availableStock, planCart, registerMarketplace, reserveStores, stockListings } from './marketplace.js';
import { registerPromotions } from './promotions.js';
import { registerStockWatches } from './stockWatch.js';
import { registerNotifications, publishNotification } from './notifications.js';
import { registerOperations, transitionOrder, serial, fail } from './operations.js';
registerDeliveryConfig(app, parse, razorpayReady);
registerDeliveryProof(app, parse);
registerDispatch(app, parse);
registerNotifications(app);
registerPromotions(app,parse);
registerStockWatches(app);
registerMarketplace(app, parse);
const sign = user => jwt.sign({ sub: user.id, role: user.role, version: user.sessionVersion }, process.env.JWT_SECRET, { jwtid: randomUUID(), expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
const userView = u => ({ id: u.id, phone: u.phone, name: u.name, email: u.email || u.loginEmail, avatarUrl: u.avatarUrl, role: u.role });
registerEmailAuth(app, { parse, sign, userView });
registerRazorpay(app, parse);
const cartFor = userId => prisma.cart.upsert({ where: { userId }, update: {}, create: { userId } });

app.get('/api/live', (_req,res)=>res.json({ok:true}));
app.get('/api/health', asyncHandler(async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ ok: true, service: 'FreshNest API', database: 'connected', timestamp: new Date().toISOString() });
}));

// OTP delivery is intentionally disabled unless a provider is configured. Development OTP is random per request.
app.post('/api/auth/otp/request', asyncHandler(async (req, res) => {
  const { phone } = parse(z.object({ phone: phoneSchema }), req.body);
  if(process.env.NODE_ENV !== 'development' || process.env.AUTH_DEV_OTP !== 'true') throw fail(503,'OTP provider is not configured.');
  const code = String(randomInt(1000, 10000));
  const codeHash = await bcrypt.hash(code, 10);
  await prisma.$transaction([prisma.otpRecord.updateMany({where:{phone,consumedAt:null},data:{consumedAt:new Date()}}),prisma.otpRecord.create({ data: { phone, codeHash, expiresAt: new Date(Date.now() + 5 * 60 * 1000) } })]);
  if (process.env.NODE_ENV === 'development' && process.env.AUTH_DEV_OTP === 'true') return res.json({ message: 'Development OTP generated. No SMS was sent.', developmentOtp: code, expiresInSeconds: 300 });
  return res.status(503).json({ error: 'OTP delivery is not configured. Configure an SMS provider before enabling production authentication.' });
}));
app.post('/api/auth/otp/verify', asyncHandler(async (req, res) => {
  const { phone, otp } = parse(z.object({ phone: phoneSchema, otp: z.string().regex(/^\d{4}$/) }), req.body);
  if(process.env.NODE_ENV !== 'development' || process.env.AUTH_DEV_OTP !== 'true') throw fail(503,'OTP provider is not configured.');
  const record = await prisma.otpRecord.findFirst({ where: { phone, consumedAt: null, expiresAt: { gt: new Date() } }, orderBy: { createdAt: 'desc' } });
  if (!record || !(await bcrypt.compare(otp, record.codeHash))) return res.status(400).json({ error: 'Invalid or expired OTP.' });
  const claimed=await prisma.otpRecord.updateMany({where:{id:record.id,consumedAt:null,expiresAt:{gt:new Date()}},data:{consumedAt:new Date()}}); if(!claimed.count) throw fail(400,'OTP already used.');
  const user = await prisma.user.upsert({ where: { phone }, update: {}, create: { phone } });
  const token = sign(user);
  res.json({ token, user: userView(user) });
}));
app.post('/api/auth/logout', auth, asyncHandler(async (req, res) => {
  const { jti, exp } = req.sessionClaims;
  if (jti && exp) {
    await prisma.revokedSession.upsert({ where: { id: jti }, update: {}, create: { id: jti, expiresAt: new Date(exp * 1000) } });
  } else {
    await prisma.user.update({ where: { id: req.user.id }, data: { sessionVersion: { increment: 1 } } });
  }
  res.json({ ok: true });
}));
app.post('/api/auth/logout-all', auth, asyncHandler(async (req, res) => {
  await prisma.user.update({ where: { id: req.user.id }, data: { sessionVersion: { increment: 1 } } });
  res.json({ ok: true });
}));
app.post('/api/cart/merge', auth, asyncHandler(async (req, res) => {
  const { mergeId, items } = parse(z.object({ mergeId: z.string().uuid(),
    items: z.array(z.object({ productId: z.string().min(1).max(100), quantity: z.number().int().min(1).max(20) })).max(400)
  }), req.body);
  const merged = await serial(async tx => {
    const inserted = await tx.guestCartMerge.createMany({ data: [{ userId: req.user.id, mergeId }], skipDuplicates: true });
    if (!inserted.count) return false;
    const cart = await tx.cart.upsert({ where: { userId: req.user.id }, update: {}, create: { userId: req.user.id } });
    const quantities = new Map(items.map(row => [row.productId, row.quantity]));
    const products = await tx.product.findMany({ where: { id: { in: [...quantities.keys()] }, isActive: true }, include: { inventory: true, storeListings: stockListings } });
    const stored = await tx.cartItem.findMany({ where: { cartId: cart.id } });
    const previous = new Map(stored.map(row => [row.productId, row.quantity]));
    for (const product of products) {
      const before = previous.get(product.id) || 0;
      const available = availableStock(product);
      const quantity = Math.max(before, Math.min(20, available, before + quantities.get(product.id)));
      if (quantity <= before) continue;
      await tx.cartItem.upsert({ where: { cartId_productId: { cartId: cart.id, productId: product.id } },
        update: { quantity }, create: { cartId: cart.id, productId: product.id, quantity } });
    }
    return true;
  });
  res.json({ merged });
}));
app.get('/api/auth/me', auth, (req, res) => res.json({ user: userView(req.user) }));
app.patch('/api/auth/profile', auth, asyncHandler(async (req, res) => {
  const data = parse(z.object({ name: z.string().trim().min(1).max(100).optional(), email: z.string().email().optional().or(z.literal('')) }), req.body);
  const user = await prisma.user.update({ where: { id: req.user.id }, data: { ...data, ...(data.email !== undefined ? {email: data.email || null} : {}) } });
  res.json({ user: userView(user) });
}));

app.get('/api/categories', asyncHandler(async (_req, res) => res.json(await prisma.category.findMany({ orderBy: { name: 'asc' } }))));
app.get('/api/products', asyncHandler(async (req, res) => {
  const { q, category, brand, sort = 'popular', page = '1', limit = '400' } = req.query;
  const where = { isActive: true, ...(category ? { category: { name: String(category) } } : {}), ...(brand ? { brand: { name: String(brand) } } : {}), ...(q ? { OR: [{ name: { contains: String(q), mode: 'insensitive' } }, { brand: { name: { contains: String(q), mode: 'insensitive' } } }] } : {}) };
  const orderBy = sort === 'price_asc' ? { price: 'asc' } : sort === 'price_desc' ? { price: 'desc' } : sort === 'name' ? { name: 'asc' } : { rating: 'desc' };
  const take = Math.min(500, Math.max(1, Math.floor(Number(limit)) || 400)); const skip = (Math.min(100000, Math.max(1, Math.floor(Number(page)) || 1)) - 1) * take;
  const [items, total] = await Promise.all([prisma.product.findMany({ where, include: { brand: true, category: true, inventory: true, storeListings: stockListings, images: true }, orderBy: [orderBy,{id:'asc'}], skip, take }), prisma.product.count({ where })]);
  res.json({ items: items.map(publicProduct), total, page: Number(page) || 1, pages: Math.ceil(total / take) });
}));
app.get('/api/products/:id', asyncHandler(async (req, res) => {
  const p = await prisma.product.findUnique({ where: { id: req.params.id }, include: { brand: true, category: true, inventory: true, storeListings: stockListings, images: true } });
  if (!p || !p.isActive) return res.status(404).json({ error: 'Product not found.' }); res.json(publicProduct(p));
}));

app.get('/api/cart', auth, asyncHandler(async (req, res) => {
  const cart = await cartFor(req.user.id);
  await prisma.cartItem.deleteMany({where:{cartId:cart.id,product:{isActive:false}}});
  const full = await prisma.cart.findUnique({ where: { id: cart.id }, include: { items: { include: { product: { include: { brand: true, category: true, inventory: true, storeListings: stockListings, images: true } } } } } });
  res.json({ items: full.items.map(i => ({ productId: i.productId, quantity: i.quantity, product: publicProduct(i.product) })) });
}));
app.put('/api/cart/items/:productId', auth, asyncHandler(async (req, res) => {
  const { quantity } = parse(z.object({ quantity: z.number().int().min(0).max(20) }), req.body);
  if (quantity === 0) { const c = await cartFor(req.user.id); await prisma.cartItem.deleteMany({ where: { cartId:c.id, productId:req.params.productId } }); return res.json({ok:true}); }
  const product = await prisma.product.findUnique({ where: { id: req.params.productId }, include: { inventory: true, storeListings: stockListings } });
  if (!product || !product.isActive) return res.status(404).json({ error: 'Product not found.' });
  const available = availableStock(product);
  if (quantity > available) return res.status(409).json({ error: `Only ${available} units are currently available.` });
  const cart = await cartFor(req.user.id);
  if (quantity === 0) await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId: product.id } });
  else await prisma.cartItem.upsert({ where: { cartId_productId: { cartId: cart.id, productId: product.id } }, update: { quantity }, create: { cartId: cart.id, productId: product.id, quantity } });
  res.json({ ok: true });
}));
app.delete('/api/cart/items/:productId', auth, asyncHandler(async (req, res) => { const c = await cartFor(req.user.id); await prisma.cartItem.deleteMany({ where: { cartId: c.id, productId: req.params.productId } }); res.json({ ok: true }); }));
app.get('/api/wishlist', auth, asyncHandler(async (req, res) => { const w = await prisma.wishlist.upsert({ where: { userId: req.user.id }, update: {}, create: { userId: req.user.id } }); const items = await prisma.wishlistItem.findMany({ where: { wishlistId: w.id, product:{isActive:true} }, select: { productId: true } }); res.json({ items: items.map(x => x.productId) }); }));
app.put('/api/wishlist/:productId', auth, asyncHandler(async (req, res) => {
  const { saved } = parse(z.object({saved:z.boolean()}),req.body);
  const w = await prisma.wishlist.upsert({where:{userId:req.user.id},update:{},create:{userId:req.user.id}});
  const productId=req.params.productId;
  if(saved){ const p=await prisma.product.findUnique({where:{id:productId}}); if(!p?.isActive) throw fail(404,'Product not found.'); await prisma.wishlistItem.upsert({where:{wishlistId_productId:{wishlistId:w.id,productId}},update:{},create:{wishlistId:w.id,productId}}); }
  else await prisma.wishlistItem.deleteMany({where:{wishlistId:w.id,productId}});
  res.json({ok:true,saved});
}));

const addressInput = z.object({ label: z.string().min(1).max(40), recipient: z.string().max(100).optional(), phone: z.string().max(15).optional(), line1: z.string().min(3).max(180), line2: z.string().max(180).optional(), landmark: z.string().max(120).optional(), city: z.string().min(2).max(80), state: z.string().min(2).max(80), pin: z.string().regex(/^\d{6}$/), instructions: z.string().max(300).optional(), isDefault: z.boolean().optional(), latitude: z.number().min(-90).max(90).optional(), longitude: z.number().min(-180).max(180).optional() });
app.get('/api/addresses', auth, asyncHandler(async (req,res) => res.json(await prisma.address.findMany({where:{userId:req.user.id,archived:false},orderBy:[{isDefault:'desc'},{createdAt:'desc'}]}))));
app.post('/api/addresses', auth, asyncHandler(async (req,res) => {
 const data=parse(addressInput.extend({ label: addressInput.shape.label.default('Home') }),req.body); const address=await serial(async tx=>{const where={userId:req.user.id,archived:false}; const count=await tx.address.count({where}); const isDefault=data.isDefault||count===0; if(isDefault) await tx.address.updateMany({where,data:{isDefault:false}}); return tx.address.create({data:{...data,isDefault,userId:req.user.id}});}); res.status(201).json(address);
}));
app.put('/api/addresses/:id',auth,asyncHandler(async(req,res)=>{
 const data=parse(addressInput.partial(),req.body); const address=await serial(async tx=>{const where={userId:req.user.id,archived:false}; const own=await tx.address.findFirst({where:{...where,id:req.params.id}}); if(!own) throw fail(404,'Address not found.'); if(data.isDefault) await tx.address.updateMany({where,data:{isDefault:false}}); if(own.isDefault && data.isDefault===false){const other=await tx.address.findFirst({where:{...where,id:{not:own.id}},orderBy:{createdAt:'asc'}}); if(other) await tx.address.update({where:{id:other.id},data:{isDefault:true}}); else data.isDefault=true;} return tx.address.update({where:{id:own.id},data});}); res.json(address);
}));
app.delete('/api/addresses/:id',auth,asyncHandler(async(req,res)=>{
 await serial(async tx=>{const where={userId:req.user.id,archived:false}; const own=await tx.address.findFirst({where:{...where,id:req.params.id}}); if(!own) throw fail(404,'Address not found.'); await tx.address.update({where:{id:own.id},data:{archived:true,isDefault:false}}); if(own.isDefault){const next=await tx.address.findFirst({where,orderBy:{createdAt:'asc'}}); if(next) await tx.address.update({where:{id:next.id},data:{isDefault:true}});}}); res.json({ok:true});
}));

async function prepareCheckout(tx,userId,{addressId,couponCode,gift,tip}) {
    const address = await tx.address.findFirst({ where: { id: addressId, userId, archived:false } }); if (!address) { const e = new Error('Select a saved delivery address.'); e.status = 400; throw e; } const zone = await tx.deliveryZone.findUnique({where:{pin:address.pin}});
    if (!zone?.serviceable) throw fail(400, 'Delivery is not available for this PIN code.');
    const fees = await settings(tx,zone);
    const cart = await tx.cart.findUnique({ where: { userId }, include: { items: { include: { product: { include: { brand: true, inventory: true, storeListings: stockListings } } } } } });
    if (!cart?.items.length) { const e = new Error('Your cart is empty.'); e.status = 400; throw e; }
    const { snapshots, groups } = planCart(cart.items,address);
    const subtotal = snapshots.reduce((sum, item) => sum + item.lineTotal, 0);
    if (subtotal < fees.minOrder) throw fail(400, 'Minimum order value is â‚¹' + fees.minOrder + '.');
    let coupon = null;
    if (couponCode) {
      coupon = await tx.coupon.findFirst({ where: { code: couponCode.toUpperCase(), active: true, OR: [{ startsAt: null }, { startsAt: { lte: new Date() } }], AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] }] }, include: { usages: true } });
      if (!coupon || subtotal < coupon.minOrder) { const e = new Error('Coupon is invalid or the minimum order value is not met.'); e.status = 400; throw e; }
      if (coupon.code === 'FIRST25' && await tx.order.count({ where: { userId } })) { const e = new Error('This coupon is only valid on your first order.'); e.status = 400; throw e; }
      if (coupon.usageLimit && coupon.usages.length >= coupon.usageLimit) { const e = new Error('Coupon usage limit reached.'); e.status = 400; throw e; }
    }
    const delivery = deliveryEstimate(groups,address,zone,fees);
    const totals = calculateOrderTotals({ items: snapshots, coupon, gift, tip, fees:{...fees,deliveryFee:delivery.deliveryFee} });
  return {address,cart,snapshots,groups,coupon,totals,delivery};
}
app.post('/api/checkout/quote',auth,asyncHandler(async(req,res)=>{
  const body=parse(z.object({addressId:z.string(),couponCode:z.string().max(30).optional(),
    gift:z.boolean().default(false),tip:z.number().int().min(0).max(500).default(0)}),req.body);
  const {snapshots,groups,totals,delivery}=await serial(tx=>prepareCheckout(tx,req.user.id,body));
  res.json({items:snapshots,totals,delivery,stores:groups.map(group=>({name:group.store?.name||'FreshNest',subtotal:group.subtotal}))});
}));

app.post('/api/orders', auth, asyncHandler(async (req, res) => {
  const { addressId, paymentMethod = 'COD', couponCode, customerNote, gift = false, tip = 0, checkoutDetails, idempotencyKey, expectedTotal } = parse(z.object({ addressId: z.string(), paymentMethod: z.enum(['COD', 'RAZORPAY']).default('COD'), couponCode: z.string().max(30).optional(), customerNote: z.string().max(500).optional(), gift: z.boolean().default(false), tip: z.number().int().min(0).max(500).default(0), idempotencyKey: z.string().uuid().optional(), expectedTotal: z.number().int().min(0).optional(), checkoutDetails:z.object({slot:z.string().max(100),giftTo:z.string().max(100).optional(),giftMsg:z.string().max(300).optional(),substitution:z.enum(['replace','remove','call']).optional()}).optional() }), req.body);
  if (paymentMethod === 'RAZORPAY' && !razorpayReady()) throw fail(503, 'Online payments are not configured. Cash on Delivery is available.');
  const paymentStatus = 'PENDING';
  const include = { items: true, address: true, statusHistory: true };
  const orderKey = idempotencyKey && { userId_idempotencyKey: { userId: req.user.id, idempotencyKey } };
  const result = await serial(async tx => {
    if (orderKey) {
      const existing = await tx.order.findUnique({ where: orderKey, include });
      if (existing) return existing;
    }
    const { address, cart, snapshots, groups, coupon, totals, delivery } = await prepareCheckout(tx, req.user.id, {addressId,couponCode,gift,tip});
    if (expectedTotal != null && totals.total !== expectedTotal) throw fail(409,'The checkout total changed. Review your updated total and try again.');
    const { subtotal, discount, deliveryFee, handlingFee, smallCartFee, giftFee, taxTotal, total } = totals;
    const order = await tx.order.create({ data: { orderNumber: `FN${randomUUID().replaceAll('-','').slice(0,16).toUpperCase()}`, userId: req.user.id, idempotencyKey, addressId, addressSnapshot: {line1:address.line1,line2:address.line2,landmark:address.landmark,city:address.city,state:address.state,pin:address.pin,recipient:address.recipient,phone:address.phone,instructions:address.instructions,latitude:address.latitude,longitude:address.longitude}, checkoutDetails:{...checkoutDetails,deliveryEstimate:delivery}, subtotal, discount, deliveryFee, handlingFee, smallCartFee, giftFee, tip, taxTotal, total, couponCode: coupon?.code, paymentMethod, paymentStatus, customerNote, items: { create: snapshots }, statusHistory: { create: { status: 'PENDING', note: 'Order placed by customer' } }, payments: { create: { amount: total, provider: paymentMethod, status: paymentStatus } } }, include: { items: true, address: true, statusHistory: true } });
    await reserveStores(tx,order,groups,totals);
    for (const line of snapshots.filter(row=>!row.storeListingId)) {
      const item=cart.items.find(row=>row.productId===line.productId);
      const changed = await tx.inventory.updateMany({ where: { productId: item.productId, quantity: { gte: item.quantity + (item.product.inventory?.reserved || 0) } }, data: { quantity: { decrement: item.quantity } } });
      if (!changed.count) { const e = new Error(`${item.product.name} is no longer available in the requested quantity.`); e.status = 409; throw e; }
      await tx.stockMovement.create({ data: { productId: item.productId, delta: -item.quantity, reason: 'ORDER_PLACED', reference: order.id } });
    }
    if (coupon) await tx.couponUsage.create({ data: { couponId: coupon.id, userId: req.user.id, orderId: order.id } });
    await publishNotification(tx,req.user.id,'Order placed',order.orderNumber,'/track/'+order.orderNumber);
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    return order;
  }).catch(async error => {
    if (error.code !== 'P2002' || !orderKey) throw error;
    const existing = await prisma.order.findUnique({ where: orderKey, include });
    if (!existing) throw error;
    return existing;
  });
  res.status(201).json(result);
}));
app.get('/api/orders', auth, asyncHandler(async (req, res) => res.json(await prisma.order.findMany({ where: { userId: req.user.id }, include: { items: true, address: true, statusHistory: { orderBy: { createdAt: 'asc' } }, returns:true, refunds:true, sellerOrders:{include:{store:{select:{name:true}}}}, deliveryAssignment:{include:{partner:{select:{name:true,phone:true}},locations:{orderBy:{recordedAt:'desc'},take:1}}} }, orderBy: { createdAt: 'desc' } }))));
app.get('/api/orders/:id', auth, asyncHandler(async (req, res) => { const o = await prisma.order.findFirst({ where: { OR: [{ id: req.params.id }, { orderNumber: req.params.id }], userId: req.user.id }, include: { items: true, address: true, statusHistory: true, returns:true, refunds:true, sellerOrders:{include:{store:{select:{name:true}}}}, deliveryAssignment:{include:{partner:{select:{name:true,phone:true}},locations:{orderBy:{recordedAt:'desc'},take:1}}} } }); if (!o) return res.status(404).json({ error: 'Order not found.' }); res.json(o); }));
app.post('/api/orders/:id/cancel', auth, asyncHandler(async(req,res)=>{
 const reason=parse(z.object({reason:z.string().max(500).optional()}),req.body||{}).reason;
 const order=await serial(async tx=>{const found=await tx.order.findFirst({where:{OR:[{id:req.params.id},{orderNumber:req.params.id}],userId:req.user.id}}); if(!found) throw fail(404,'Order not found.'); return transitionOrder(tx,found.id,'CANCELLED',reason||'Cancelled by customer');}); res.json(order);
}));

// Customer support and returns.
app.get('/api/support/tickets', auth, asyncHandler(async (req, res) => res.json(await prisma.supportTicket.findMany({ where: { userId: req.user.id }, include: { messages: { orderBy: { createdAt: 'asc' } } }, orderBy: { createdAt: 'desc' } }))));
app.post('/api/support/tickets', auth, asyncHandler(async (req, res) => {
  const { subject, message } = parse(z.object({ subject: z.string().min(4).max(160), message: z.string().min(2).max(2000) }), req.body);
  const ticket = await prisma.supportTicket.create({ data: { userId: req.user.id, subject, messages: { create: { senderId: req.user.id, message } } }, include: { messages: true } }); res.status(201).json(ticket);
}));
app.post('/api/support/tickets/:id/messages', auth, asyncHandler(async (req, res) => {
  const { message } = parse(z.object({ message: z.string().min(2).max(2000) }), req.body);
  const ticket = await prisma.supportTicket.findFirst({ where: { id: req.params.id, userId: req.user.id } }); if (!ticket) return res.status(404).json({ error: 'Support ticket not found.' });
  if (ticket.status === 'CLOSED') throw fail(409, 'This ticket is closed. Create a new ticket for further help.');
  const row = await prisma.supportTicket.update({
    where: { id: ticket.id },
    data: {
      status: 'OPEN',
      messages: { create: { senderId: req.user.id, message } }
    }
  });
  res.status(201).json(row);
}));
app.post('/api/orders/:id/returns', auth, asyncHandler(async (req, res) => {
  const { reason } = parse(z.object({ reason: z.string().min(5).max(500) }), req.body);
  const result=await serial(async tx=>{const order=await tx.order.findFirst({where:{OR:[{id:req.params.id},{orderNumber:req.params.id}],userId:req.user.id}}); if(!order) throw fail(404,'Order not found.'); if(order.status!=='DELIVERED') throw fail(409,'Returns require a delivered order.'); if(await tx.returnRequest.findFirst({where:{orderId:order.id,status:{not:'REJECTED'}}})) throw fail(409,'A return already exists.'); return tx.returnRequest.create({data:{orderId:order.id,userId:req.user.id,reason}});}); res.status(201).json(result);
}));

app.post('/api/admin/products/:id/images', auth, roles('ADMIN'), asyncHandler(async (req, res) => {
  const data = parse(z.object({ url: z.string().min(2).max(500).refine(v => v.startsWith('/products/') || /^https:\/\//i.test(v), 'Use a local /products path or HTTPS image URL.'), sourceUrl: z.string().url().startsWith('https://'), licenseNote: z.string().min(8).max(500), alt: z.string().min(5).max(250), verified: z.boolean() }), req.body);
  if (!data.verified) return res.status(400).json({ error: 'Only images that have been manually checked against the exact brand and variant can be published.' });
  const product = await prisma.product.findUnique({ where: { id: req.params.id } }); if (!product) return res.status(404).json({ error: 'Product not found.' });
  const image = await prisma.$transaction(async tx => { await tx.productImage.updateMany({ where: { productId: product.id }, data: { isPrimary: false } }); const created = await tx.productImage.create({ data: { productId: product.id, url: data.url, sourceUrl: data.sourceUrl, licenseNote: data.licenseNote, alt: data.alt, verifiedAt: new Date(), isPrimary: true } }); await tx.product.update({ where: { id: product.id }, data: { imageStatus: 'VERIFIED' } }); return created; }); res.status(201).json(image);
}));

registerOperations(app);

app.use((req, res) => res.status(404).json({ error: 'API route not found.' }));
app.use((err, _req, res, _next) => { const status=err.status || ({P2025:404,P2002:409,P2003:409,P2034:409}[err.code]) || 500; if(status>=500)console.error('API request failed',{code:err.code||err.name,status}); res.status(status).json({ error: err.status ? err.message : status===404?'Record not found.':status===409?'Data conflict. Refresh and try again.':'An unexpected server error occurred.' }); });


