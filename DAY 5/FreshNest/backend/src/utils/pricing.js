import { FEES } from '../../../src/data/config.js';
export function calculateOrderTotals({ items, coupon, gift = false, tip = 0, fees = FEES }) {
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const taxTotal = items.reduce((sum, item) => sum + Math.round(item.lineTotal - item.lineTotal / (1 + item.taxRate / 100)), 0);
  let discount = 0;
  if (coupon?.type === 'FLAT') discount = coupon.value;
  if (coupon?.type === 'PERCENT') discount = Math.min(Math.round(subtotal * coupon.value / 100), coupon.maxDiscount ?? subtotal);
  discount = Math.min(discount, subtotal);
  const deliveryFee = subtotal >= fees.freeDeliveryAbove || coupon?.type === 'FREE_DELIVERY' ? 0 : fees.deliveryFee;
  const handlingFee = subtotal > 0 ? fees.handling : 0;
  const smallCartFee = subtotal > 0 && subtotal < fees.smallCartBelow ? fees.smallCartFee : 0;
  const giftFee = gift ? fees.giftPacking : 0;
  const safeTip = Math.min(500, Math.max(0, Math.round(tip || 0)));
  return { subtotal, discount, deliveryFee, handlingFee, smallCartFee, giftFee, tip: safeTip, taxTotal, total: Math.max(0, subtotal - discount + deliveryFee + handlingFee + smallCartFee + giftFee + safeTip) };
}
