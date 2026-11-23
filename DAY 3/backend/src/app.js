import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { randomInt } from 'node:crypto';
import { prisma } from './db.js';
import { auth, roles } from './middleware/auth.js';
import { asyncHandler, publicProduct } from './utils/http.js';
import { calculateOrderTotals } from './utils/pricing.js';

export const app = express();
app.use(helmet());
app.use(cors({ origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(s => s.trim()), credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false }));
const parse = (schema, data) => { const r = schema.safeParse(data); if (!r.success) { const e = new Error(r.error.issues.map(x => x.message).join(' ')); e.status = 400; throw e; } return r.data; };
const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number.');
const SERVICEABLE_PINS = new Set(['600001', '600020', '600040', '600096', '560001']);
const sign = user => jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
const userView = u => ({ id: u.id, phone: u.phone, name: u.name, email: u.email, role: u.role });
const cartFor = userId => prisma.cart.upsert({ where: { userId }, update: {}, create: { userId } });

app.get('/api/health', asyncHandler(async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ ok: true, service: 'FreshNest API', database: 'connected', timestamp: new Date().toISOString() });
}));

// OTP delivery is intentionally disabled unless a provider is configured. Development OTP is random per request.
app.post('/api/auth/otp/request', asyncHandler(async (req, res) => {
  const { phone } = parse(z.object({ phone: phoneSchema }), req.body);
  const code = String(randomInt(1000, 10000));
  const codeHash = await bcrypt.hash(code, 10);
  await prisma.otpRecord.create({ data: { phone, codeHash, expiresAt: new Date(Date.now() + 5 * 60 * 1000) } });
  if (process.env.NODE_ENV === 'development' && process.env.AUTH_DEV_OTP === 'true') return res.json({ message: 'Development OTP generated. No SMS was sent.', developmentOtp: code, expiresInSeconds: 300 });
  return res.status(503).json({ error: 'OTP delivery is not configured. Configure an SMS provider before enabling production authentication.' });
}));
app.post('/api/auth/otp/verify', asyncHandler(async (req, res) => {
  const { phone, otp } = parse(z.object({ phone: phoneSchema, otp: z.string().regex(/^\d{4}$/) }), req.body);
  const record = await prisma.otpRecord.findFirst({ where: { phone, consumedAt: null, expiresAt: { gt: new Date() } }, orderBy: { createdAt: 'desc' } });
  if (!record || !(await bcrypt.compare(otp, record.codeHash))) return res.status(400).json({ error: 'Invalid or expired OTP.' });
  await prisma.otpRecord.update({ where: { id: record.id }, data: { consumedAt: new Date() } });
  const user = await prisma.user.upsert({ where: { phone }, update: {}, create: { phone } });
  const token = sign(user);
  res.json({ token, user: userView(user) });
}));
app.get('/api/auth/me', auth, (req, res) => res.json({ user: userView(req.user) }));
app.patch('/api/auth/profile', auth, asyncHandler(async (req, res) => {
  const data = parse(z.object({ name: z.string().trim().min(1).max(100).optional(), email: z.string().email().optional().or(z.literal('')) }), req.body);
  const user = await prisma.user.update({ where: { id: req.user.id }, data: { ...data, email: data.email || null } });
  res.json({ user: userView(user) });
}));

app.get('/api/categories', asyncHandler(async (_req, res) => res.json(await prisma.category.findMany({ orderBy: { name: 'asc' } }))));
app.get('/api/products', asyncHandler(async (req, res) => {
  const { q, category, brand, sort = 'popular', page = '1', limit = '400' } = req.query;
  const where = { isActive: true, ...(category ? { category: { name: String(category) } } : {}), ...(brand ? { brand: { name: String(brand) } } : {}), ...(q ? { OR: [{ name: { contains: String(q), mode: 'insensitive' } }, { brand: { name: { contains: String(q), mode: 'insensitive' } } }] } : {}) };
  const orderBy = sort === 'price_asc' ? { price: 'asc' } : sort === 'price_desc' ? { price: 'desc' } : sort === 'name' ? { name: 'asc' } : { rating: 'desc' };
  const take = Math.min(500, Math.max(1, Number(limit) || 400)); const skip = (Math.max(1, Number(page) || 1) - 1) * take;
  const [items, total] = await Promise.all([prisma.product.findMany({ where, include: { brand: true, category: true, inventory: true, images: true }, orderBy, skip, take }), prisma.product.count({ where })]);
  res.json({ items: items.map(publicProduct), total, page: Number(page) || 1, pages: Math.ceil(total / take) });
}));
app.get('/api/products/:id', asyncHandler(async (req, res) => {
  const p = await prisma.product.findUnique({ where: { id: req.params.id }, include: { brand: true, category: true, inventory: true, images: true } });
  if (!p || !p.isActive) return res.status(404).json({ error: 'Product not found.' }); res.json(publicProduct(p));
}));

app.get('/api/cart', auth, asyncHandler(async (req, res) => {
  const cart = await cartFor(req.user.id);
  const full = await prisma.cart.findUnique({ where: { id: cart.id }, include: { items: { include: { product: { include: { brand: true, category: true, inventory: true, images: true } } } } } });
  res.json({ items: full.items.map(i => ({ productId: i.productId, quantity: i.quantity, product: publicProduct(i.product) })) });
}));
app.put('/api/cart/items/:productId', auth, asyncHandler(async (req, res) => {
  const { quantity } = parse(z.object({ quantity: z.number().int().min(0).max(20) }), req.body);
  const product = await prisma.product.findUnique({ where: { id: req.params.productId }, include: { inventory: true } });
  if (!product || !product.isActive) return res.status(404).json({ error: 'Product not found.' });
  const available = Math.max(0, (product.inventory?.quantity || 0) - (product.inventory?.reserved || 0));
  if (quantity > available) return res.status(409).json({ error: `Only ${available} units are currently available.` });
  const cart = await cartFor(req.user.id);
  if (quantity === 0) await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId: product.id } });
  else await prisma.cartItem.upsert({ where: { cartId_productId: { cartId: cart.id, productId: product.id } }, update: { quantity }, create: { cartId: cart.id, productId: product.id, quantity } });
  res.json({ ok: true });
}));
app.delete('/api/cart/items/:productId', auth, asyncHandler(async (req, res) => { const c = await cartFor(req.user.id); await prisma.cartItem.deleteMany({ where: { cartId: c.id, productId: req.params.productId } }); res.json({ ok: true }); }));
app.get('/api/wishlist', auth, asyncHandler(async (req, res) => { const w = await prisma.wishlist.upsert({ where: { userId: req.user.id }, update: {}, create: { userId: req.user.id } }); const items = await prisma.wishlistItem.findMany({ where: { wishlistId: w.id }, select: { productId: true } }); res.json({ items: items.map(x => x.productId) }); }));
app.put('/api/wishlist/:productId', auth, asyncHandler(async (req, res) => { const w = await prisma.wishlist.upsert({ where: { userId: req.user.id }, update: {}, create: { userId: req.user.id } }); const product = await prisma.product.findUnique({ where: { id: req.params.productId } }); if (!product) return res.status(404).json({ error: 'Product not found.' }); const exists = await prisma.wishlistItem.findUnique({ where: { wishlistId_productId: { wishlistId: w.id, productId: product.id } } }); if (exists) await prisma.wishlistItem.delete({ where: { id: exists.id } }); else await prisma.wishlistItem.create({ data: { wishlistId: w.id, productId: product.id } }); res.json({ ok: true, saved: !exists }); }));

const addressInput = z.object({ label: z.string().min(1).max(40).default('Home'), recipient: z.string().max(100).optional(), phone: z.string().max(15).optional(), line1: z.string().min(3).max(180), line2: z.string().max(180).optional(), landmark: z.string().max(120).optional(), city: z.string().min(2).max(80), state: z.string().min(2).max(80), pin: z.string().regex(/^\d{6}$/), instructions: z.string().max(300).optional(), isDefault: z.boolean().optional(), latitude: z.number().optional(), longitude: z.number().optional() });
app.get('/api/addresses', auth, asyncHandler(async (req, res) => res.json(await prisma.address.findMany({ where: { userId: req.user.id }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] }))));
app.post('/api/addresses', auth, asyncHandler(async (req, res) => {
  const data = parse(addressInput, req.body);
  const address = await prisma.$transaction(async tx => { if (data.isDefault) await tx.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } }); const count = await tx.address.count({ where: { userId: req.user.id } }); return tx.address.create({ data: { ...data, isDefault: data.isDefault ?? count === 0, userId: req.user.id } }); });
  res.status(201).json(address);
}));
app.put('/api/addresses/:id', auth, asyncHandler(async (req, res) => {
  const data = parse(addressInput.partial(), req.body);
  const address = await prisma.$transaction(async tx => { const own = await tx.address.findFirst({ where: { id: req.params.id, userId: req.user.id } }); if (!own) return null; if (data.isDefault) await tx.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } }); return tx.address.update({ where: { id: own.id }, data }); });
  if (!address) return res.status(404).json({ error: 'Address not found.' }); res.json(address);
}));
app.delete('/api/addresses/:id', auth, asyncHandler(async (req, res) => { const own = await prisma.address.findFirst({ where: { id: req.params.id, userId: req.user.id } }); if (!own) return res.status(404).json({ error: 'Address not found.' }); await prisma.$transaction(async tx => { await tx.address.delete({ where: { id: own.id } }); const first = await tx.address.findFirst({ where: { userId: req.user.id }, orderBy: { createdAt: 'asc' } }); if (own.isDefault && first) await tx.address.update({ where: { id: first.id }, data: { isDefault: true } }); }); res.json({ ok: true }); }));

app.post('/api/orders', auth, asyncHandler(async (req, res) => {
  const { addressId, paymentMethod = 'COD', couponCode, customerNote, gift = false, tip = 0 } = parse(z.object({ addressId: z.string(), paymentMethod: z.enum(['COD','UPI','CARD','NETBANKING','WALLET']).default('COD'), couponCode: z.string().max(30).optional(), customerNote: z.string().max(500).optional(), gift: z.boolean().default(false), tip: z.number().int().min(0).max(500).default(0) }), req.body);
  if (paymentMethod !== 'COD') return res.status(503).json({ error: 'Online payment is not configured yet. Select Cash on Delivery; no online payment has been attempted.' });
  const result = await prisma.$transaction(async tx => {
    const address = await tx.address.findFirst({ where: { id: addressId, userId: req.user.id } }); if (!address) { const e = new Error('Select a saved delivery address.'); e.status = 400; throw e; } if (!SERVICEABLE_PINS.has(address.pin)) { const e = new Error('Delivery is not configured for this PIN code yet.'); e.status = 400; throw e; }
    const cart = await tx.cart.findUnique({ where: { userId: req.user.id }, include: { items: { include: { product: { include: { brand: true, inventory: true } } } } } });
    if (!cart?.items.length) { const e = new Error('Your cart is empty.'); e.status = 400; throw e; }
    const snapshots = [];
    for (const item of cart.items) {
      const p = item.product; const stock = p.inventory?.quantity || 0;
      if (stock < item.quantity) { const e = new Error(`${p.name}: only ${stock} left in stock.`); e.status = 409; throw e; }
      const unitPrice = Math.round(p.price * (100 - p.discount) / 100); const lineTotal = unitPrice * item.quantity;
      snapshots.push({ productId: p.id, productName: p.name, brandName: p.brand.name, unit: p.unit, quantity: item.quantity, unitPrice, discount: p.discount, taxRate: p.gst, lineTotal });
    }
    const subtotal = snapshots.reduce((sum, item) => sum + item.lineTotal, 0);
    if (subtotal < 49) { const e = new Error('Minimum order value is ₹49.'); e.status = 400; throw e; }
    let coupon = null;
    if (couponCode) {
      coupon = await tx.coupon.findFirst({ where: { code: couponCode.toUpperCase(), active: true, OR: [{ startsAt: null }, { startsAt: { lte: new Date() } }], AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] }] }, include: { usages: true } });
      if (!coupon || subtotal < coupon.minOrder) { const e = new Error('Coupon is invalid or the minimum order value is not met.'); e.status = 400; throw e; }
      if (coupon.code === 'FIRST25' && await tx.order.count({ where: { userId: req.user.id } })) { const e = new Error('This coupon is only valid on your first order.'); e.status = 400; throw e; }
      if (coupon.usageLimit && coupon.usages.length >= coupon.usageLimit) { const e = new Error('Coupon usage limit reached.'); e.status = 400; throw e; }
    }
    const totals = calculateOrderTotals({ items: snapshots, coupon, gift, tip });
    const { discount, deliveryFee, handlingFee, smallCartFee, giftFee, taxTotal, total } = totals;
    const order = await tx.order.create({ data: { orderNumber: `FN${Date.now().toString().slice(-8)}${randomInt(10,99)}`, userId: req.user.id, addressId, subtotal, discount, deliveryFee, handlingFee, smallCartFee, giftFee, tip, taxTotal, total, couponCode: coupon?.code, paymentMethod, paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PENDING', customerNote, items: { create: snapshots }, statusHistory: { create: { status: 'PENDING', note: 'Order placed by customer' } }, payments: { create: { amount: total, provider: 'UNCONFIGURED', status: 'PENDING' } } }, include: { items: true, address: true, statusHistory: true } });
    for (const item of cart.items) {
      const changed = await tx.inventory.updateMany({ where: { productId: item.productId, quantity: { gte: item.quantity } }, data: { quantity: { decrement: item.quantity } } });
      if (!changed.count) { const e = new Error(`${item.product.name} is no longer available in the requested quantity.`); e.status = 409; throw e; }
      await tx.stockMovement.create({ data: { productId: item.productId, delta: -item.quantity, reason: 'ORDER_PLACED', reference: order.id } });
    }
    if (coupon) await tx.couponUsage.create({ data: { couponId: coupon.id, userId: req.user.id, orderId: order.id } });
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    return order;
  }, { maxWait: 10000, timeout: 20000 });
  res.status(201).json(result);
}));
app.get('/api/orders', auth, asyncHandler(async (req, res) => res.json(await prisma.order.findMany({ where: { userId: req.user.id }, include: { items: true, address: true, statusHistory: { orderBy: { createdAt: 'asc' } } }, orderBy: { createdAt: 'desc' } }))));
app.get('/api/orders/:id', auth, asyncHandler(async (req, res) => { const o = await prisma.order.findFirst({ where: { OR: [{ id: req.params.id }, { orderNumber: req.params.id }], userId: req.user.id }, include: { items: true, address: true, statusHistory: true } }); if (!o) return res.status(404).json({ error: 'Order not found.' }); res.json(o); }));
app.post('/api/orders/:id/cancel', auth, asyncHandler(async (req, res) => {
  const order = await prisma.$transaction(async tx => {
    const found = await tx.order.findFirst({ where: { OR: [{ id: req.params.id }, { orderNumber: req.params.id }], userId: req.user.id }, include: { items: true } });
    if (!found) return null; if (!['PENDING','CONFIRMED'].includes(found.status)) { const e = new Error('This order can no longer be cancelled. Contact support for help.'); e.status = 409; throw e; }
    const updated = await tx.order.update({ where: { id: found.id }, data: { status: 'CANCELLED' } });
    for (const item of found.items) { await tx.inventory.update({ where: { productId: item.productId }, data: { quantity: { increment: item.quantity } } }); await tx.stockMovement.create({ data: { productId: item.productId, delta: item.quantity, reason: 'ORDER_CANCELLED', reference: found.id } }); }
    await tx.orderStatusHistory.create({ data: { orderId: found.id, status: 'CANCELLED', note: 'Cancelled by customer; stock restored' } }); return updated;
  });
  if (!order) return res.status(404).json({ error: 'Order not found.' }); res.json(order);
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
  const row = await prisma.supportMessage.create({ data: { ticketId: ticket.id, senderId: req.user.id, message } }); res.status(201).json(row);
}));
app.post('/api/orders/:id/returns', auth, asyncHandler(async (req, res) => {
  const { reason } = parse(z.object({ reason: z.string().min(5).max(500) }), req.body);
  const order = await prisma.order.findFirst({ where: { OR: [{ id: req.params.id }, { orderNumber: req.params.id }], userId: req.user.id } });
  if (!order) return res.status(404).json({ error: 'Order not found.' }); if (order.status !== 'DELIVERED') return res.status(409).json({ error: 'Returns can only be requested for delivered orders.' });
  const result = await prisma.returnRequest.create({ data: { orderId: order.id, userId: req.user.id, reason } }); res.status(201).json(result);
}));

// Seller onboarding and isolated seller product access.
app.post('/api/seller/apply', auth, asyncHandler(async (req, res) => {
  const { storeName } = parse(z.object({ storeName: z.string().min(2).max(120) }), req.body);
  const seller = await prisma.seller.upsert({ where: { userId: req.user.id }, update: { storeName }, create: { userId: req.user.id, storeName } }); res.status(201).json(seller);
}));
app.get('/api/seller/me', auth, roles('SELLER'), asyncHandler(async (req, res) => res.json(await prisma.seller.findUnique({ where: { userId: req.user.id }, include: { products: { include: { product: true } }, settlements: true } }))));
app.get('/api/seller/products', auth, roles('SELLER'), asyncHandler(async (req, res) => { const seller = await prisma.seller.findUnique({ where: { userId: req.user.id } }); if (!seller?.approved) return res.status(403).json({ error: 'Seller account is awaiting approval.' }); res.json(await prisma.sellerProduct.findMany({ where: { sellerId: seller.id }, include: { product: { include: { brand: true, category: true, inventory: true } } } })); }));

app.get('/api/admin/overview', auth, roles('ADMIN'), asyncHandler(async (_req, res) => {
  const [products, orders, users, revenue, lowStock] = await Promise.all([prisma.product.count(), prisma.order.count(), prisma.user.count(), prisma.order.aggregate({ where: { paymentStatus: { in: ['PAID','AUTHORIZED'] } }, _sum: { total: true } }), prisma.inventory.count({ where: { quantity: { lte: 10 } } })]);
  res.json({ products, orders, customers: users, paidRevenue: revenue._sum.total || 0, lowStock });
}));
app.get('/api/admin/orders', auth, roles('ADMIN'), asyncHandler(async (_req, res) => res.json(await prisma.order.findMany({ include: { user: { select: { phone: true, name: true } }, address: true, items: true }, orderBy: { createdAt: 'desc' }, take: 200 }))));
app.patch('/api/admin/orders/:id/status', auth, roles('ADMIN'), asyncHandler(async (req, res) => {
  const status = parse(z.enum(['CONFIRMED','PROCESSING','PACKED','OUT_FOR_DELIVERY','DELIVERED','CANCELLED','RETURNED']), req.body.status);
  const order = await prisma.$transaction(async tx => { const found = await tx.order.findUnique({ where: { id: req.params.id }, include: { items: true } }); if (!found) return null; if (status === 'CANCELLED' && !['PENDING','CONFIRMED'].includes(found.status)) { const e = new Error('This order cannot be cancelled after processing has started.'); e.status = 409; throw e; } if (status === 'CANCELLED' && found.status !== 'CANCELLED') { for (const item of found.items) { await tx.inventory.update({ where: { productId: item.productId }, data: { quantity: { increment: item.quantity } } }); await tx.stockMovement.create({ data: { productId: item.productId, delta: item.quantity, reason: 'ADMIN_ORDER_CANCELLED', reference: found.id } }); } } const updated = await tx.order.update({ where: { id: found.id }, data: { status } }); await tx.orderStatusHistory.create({ data: { orderId: found.id, status, note: `Updated by admin ${req.user.id}` } }); await tx.auditLog.create({ data: { userId: req.user.id, action: 'ORDER_STATUS_UPDATE', entity: 'Order', entityId: found.id, metadata: { status } } }); return updated; });
  if (!order) return res.status(404).json({ error: 'Order not found.' }); res.json(order);
}));
app.patch('/api/admin/products/:id/inventory', auth, roles('ADMIN'), asyncHandler(async (req, res) => {
  const { quantity, reason = 'ADMIN_ADJUSTMENT' } = parse(z.object({ quantity: z.number().int().min(0), reason: z.string().max(100).default('ADMIN_ADJUSTMENT') }), req.body);
  const current = await prisma.inventory.findUnique({ where: { productId: req.params.id } }); if (!current) return res.status(404).json({ error: 'Inventory record not found.' });
  const delta = quantity - current.quantity; const updated = await prisma.$transaction(async tx => { const v = await tx.inventory.update({ where: { productId: req.params.id }, data: { quantity } }); if (delta) await tx.stockMovement.create({ data: { productId: req.params.id, delta, reason } }); return v; }); res.json(updated);
}));
app.patch('/api/admin/products/:id', auth, roles('ADMIN'), asyncHandler(async (req, res) => {
  const data = parse(z.object({ price: z.number().int().positive().optional(), discount: z.number().int().min(0).max(90).optional(), isActive: z.boolean().optional() }), req.body);
  const product = await prisma.product.update({ where: { id: req.params.id }, data }); res.json(product);
}));
app.post('/api/admin/products/:id/images', auth, roles('ADMIN'), asyncHandler(async (req, res) => {
  const data = parse(z.object({ url: z.string().min(2).max(500).refine(v => v.startsWith('/products/') || /^https:\/\//i.test(v), 'Use a local /products path or HTTPS image URL.'), sourceUrl: z.string().url().startsWith('https://'), licenseNote: z.string().min(8).max(500), alt: z.string().min(5).max(250), verified: z.boolean() }), req.body);
  if (!data.verified) return res.status(400).json({ error: 'Only images that have been manually checked against the exact brand and variant can be published.' });
  const product = await prisma.product.findUnique({ where: { id: req.params.id } }); if (!product) return res.status(404).json({ error: 'Product not found.' });
  const image = await prisma.$transaction(async tx => { await tx.productImage.updateMany({ where: { productId: product.id }, data: { isPrimary: false } }); const created = await tx.productImage.create({ data: { productId: product.id, url: data.url, sourceUrl: data.sourceUrl, licenseNote: data.licenseNote, alt: data.alt, verifiedAt: new Date(), isPrimary: true } }); await tx.product.update({ where: { id: product.id }, data: { imageStatus: 'VERIFIED' } }); return created; }); res.status(201).json(image);
}));


app.get('/api/admin/sellers', auth, roles('ADMIN'), asyncHandler(async (_req, res) => res.json(await prisma.seller.findMany({ include: { user: { select: { phone: true, email: true } } }, orderBy: { createdAt: 'desc' } }))));
app.patch('/api/admin/sellers/:id/approve', auth, roles('ADMIN'), asyncHandler(async (req, res) => {
  const seller = await prisma.seller.update({ where: { id: req.params.id }, data: { approved: true } }); await prisma.user.update({ where: { id: seller.userId }, data: { role: 'SELLER' } }); res.json({ ok: true, seller });
}));
app.get('/api/admin/returns', auth, roles('ADMIN'), asyncHandler(async (_req, res) => res.json(await prisma.returnRequest.findMany({ include: { order: true }, orderBy: { createdAt: 'desc' } }))));
app.patch('/api/admin/returns/:id', auth, roles('ADMIN'), asyncHandler(async (req, res) => { const status = parse(z.enum(['APPROVED','REJECTED','PICKED_UP']), req.body.status); const result = await prisma.returnRequest.update({ where: { id: req.params.id }, data: { status } }); return res.json(result); }));
app.post('/api/admin/orders/:id/delivery-assignment', auth, roles('ADMIN'), asyncHandler(async (req, res) => {
  const { partnerPhone } = parse(z.object({ partnerPhone: phoneSchema }), req.body);
  const [order, partner] = await Promise.all([prisma.order.findUnique({ where: { id: req.params.id } }), prisma.user.findUnique({ where: { phone: partnerPhone } })]);
  if (!order) return res.status(404).json({ error: 'Order not found.' }); if (!partner || partner.role !== 'DELIVERY_PARTNER') return res.status(400).json({ error: 'The phone number does not belong to an approved delivery partner.' });
  const assignment = await prisma.deliveryAssignment.upsert({ where: { orderId: order.id }, update: { partnerId: partner.id, status: 'ASSIGNED' }, create: { orderId: order.id, partnerId: partner.id } }); res.status(201).json(assignment);
}));
app.patch('/api/delivery/assignments/:id/status', auth, roles('DELIVERY_PARTNER'), asyncHandler(async (req, res) => {
  const { status } = parse(z.object({ status: z.enum(['ACCEPTED','PICKED_UP','OUT_FOR_DELIVERY','DELIVERED']) }), req.body);
  const assignment = await prisma.deliveryAssignment.findFirst({ where: { id: req.params.id, partnerId: req.user.id } }); if (!assignment) return res.status(404).json({ error: 'Delivery assignment not found.' });
  const updated = await prisma.deliveryAssignment.update({ where: { id: assignment.id }, data: { status } });
  const orderStatus = status === 'PICKED_UP' ? 'PACKED' : status === 'OUT_FOR_DELIVERY' ? 'OUT_FOR_DELIVERY' : status === 'DELIVERED' ? 'DELIVERED' : null;
  if (orderStatus) { await prisma.order.update({ where: { id: assignment.orderId }, data: { status: orderStatus } }); await prisma.orderStatusHistory.create({ data: { orderId: assignment.orderId, status: orderStatus, note: `Delivery partner update: ${status}` } }); }
  res.json(updated);
}));
app.post('/api/delivery/assignments/:id/location', auth, roles('DELIVERY_PARTNER'), asyncHandler(async (req, res) => {
  const { latitude, longitude } = parse(z.object({ latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180) }), req.body);
  const assignment = await prisma.deliveryAssignment.findFirst({ where: { id: req.params.id, partnerId: req.user.id } }); if (!assignment) return res.status(404).json({ error: 'Delivery assignment not found.' });
  const point = await prisma.deliveryLocation.create({ data: { assignmentId: assignment.id, latitude, longitude } }); res.status(201).json(point);
}));

app.use((req, res) => res.status(404).json({ error: 'API route not found.' }));
app.use((err, _req, res, _next) => { console.error(err); res.status(err.status || 500).json({ error: err.status ? err.message : 'An unexpected server error occurred.' }); });
