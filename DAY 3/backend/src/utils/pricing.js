export function calculateOrderTotals({ items, coupon, gift = false, tip = 0 }) {
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const taxTotal = items.reduce((sum, item) => sum + Math.round(item.lineTotal - item.lineTotal / (1 + item.taxRate / 100)), 0);
  let discount = 0;
  if (coupon?.type === 'FLAT') discount = coupon.value;
  if (coupon?.type === 'PERCENT') discount = Math.min(Math.round(subtotal * coupon.value / 100), coupon.maxDiscount ?? subtotal);
  discount = Math.min(discount, subtotal);
  const deliveryFee = subtotal >= 499 || coupon?.type === 'FREE_DELIVERY' ? 0 : 25;
  const handlingFee = subtotal > 0 ? 5 : 0;
  const smallCartFee = subtotal > 0 && subtotal < 99 ? 20 : 0;
  const giftFee = gift ? 40 : 0;
  const safeTip = Math.min(500, Math.max(0, Math.round(tip || 0)));
  return { subtotal, discount, deliveryFee, handlingFee, smallCartFee, giftFee, tip: safeTip, taxTotal, total: Math.max(0, subtotal - discount + deliveryFee + handlingFee + smallCartFee + giftFee + safeTip) };
}
