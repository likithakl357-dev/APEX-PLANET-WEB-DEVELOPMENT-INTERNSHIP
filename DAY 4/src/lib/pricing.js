import { FEES, COUPONS } from '../data/config.js';
import { productById, sellPrice } from '../data/products.js';

export function evaluateCoupon(code, subtotal, hasOrders) {
  const c = COUPONS.find(x => x.code === String(code).trim().toUpperCase());
  if (!c) return { ok: false, message: 'Invalid coupon code.' };
  if (c.firstOrderOnly && hasOrders) return { ok: false, message: `${c.code} is valid on a first order only.` };
  if (subtotal < c.min) return { ok: false, message: `Add ₹${c.min - subtotal} more to use ${c.code} (min order ₹${c.min}).` };
  return { ok: true, coupon: c };
}

export function computeBill({ cart, coupon, gift, tip }) {
  const lines = Object.entries(cart).filter(([id]) => productById[id]).map(([id, qty]) => {
    const p = productById[id]; const unit = sellPrice(p);
    const total = unit * qty;
    const taxable = total / (1 + p.gst / 100); // prices are tax-inclusive
    return { p, qty, unit, total, mrpTotal: p.price * qty, gstRate: p.gst, gstAmount: total - taxable };
  });
  const subtotal = lines.reduce((s, l) => s + l.total, 0);
  const mrpTotal = lines.reduce((s, l) => s + l.mrpTotal, 0);
  const productDiscount = mrpTotal - subtotal;
  let delivery = subtotal === 0 ? 0 : subtotal >= FEES.freeDeliveryAbove ? 0 : FEES.deliveryFee;
  let couponDiscount = 0;
  if (coupon) {
    if (coupon.type === 'flat') couponDiscount = coupon.value;
    if (coupon.type === 'percent') couponDiscount = Math.min(Math.round(subtotal * coupon.value / 100), coupon.max);
    if (coupon.type === 'freedelivery') { couponDiscount = delivery; delivery = 0; }
  }
  couponDiscount = Math.min(couponDiscount, subtotal);
  const handling = subtotal ? FEES.handling : 0;
  const smallCart = subtotal && subtotal < FEES.smallCartBelow ? FEES.smallCartFee : 0;
  const giftFee = gift ? FEES.giftPacking : 0;
  const tipValue = Math.min(500, Math.max(0, Math.round(Number(tip) || 0)));
  const gstTotal = lines.reduce((s, l) => s + l.gstAmount, 0);
  const total = Math.max(0, subtotal - (coupon?.type === 'freedelivery' ? 0 : couponDiscount) + delivery + handling + smallCart + giftFee + tipValue);
  return { lines, subtotal, mrpTotal, productDiscount, couponDiscount, delivery, handling, smallCart, giftFee, tipValue, gstTotal, total };
}

export function bestCoupon(subtotal, hasOrders) {
  const saving = c => c.type === 'flat' ? c.value : c.type === 'percent' ? Math.min(Math.round(subtotal * c.value / 100), c.max) : FEES.deliveryFee;
  return COUPONS.filter(c => evaluateCoupon(c.code, subtotal, hasOrders).ok)
    .map(c => ({ ...c, saving: saving(c) })).sort((a, b) => b.saving - a.saving)[0] || null;
}
