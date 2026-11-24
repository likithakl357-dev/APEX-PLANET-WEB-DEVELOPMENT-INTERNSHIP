import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateOrderTotals } from '../src/utils/pricing.js';

test('calculates base fees and subtotal correctly', () => {
  const r = calculateOrderTotals({ items: [{ lineTotal: 200, taxRate: 5 }] });
  assert.equal(r.subtotal, 200); assert.equal(r.deliveryFee, 25); assert.equal(r.handlingFee, 5); assert.equal(r.total, 230);
});
test('applies flat and percentage discounts with caps', () => {
  const items = [{ lineTotal: 500, taxRate: 5 }];
  assert.equal(calculateOrderTotals({ items, coupon: { type: 'FLAT', value: 50 } }).total, 455);
  assert.equal(calculateOrderTotals({ items, coupon: { type: 'PERCENT', value: 20, maxDiscount: 60 } }).discount, 60);
});
test('free delivery, small basket, gift and tip are handled', () => {
  const r = calculateOrderTotals({ items: [{ lineTotal: 80, taxRate: 5 }], coupon: { type: 'FREE_DELIVERY' }, gift: true, tip: 10 });
  assert.equal(r.deliveryFee, 0); assert.equal(r.smallCartFee, 20); assert.equal(r.giftFee, 40); assert.equal(r.total, 155);
});
test('tips are bounded to the configured limit', () => {
  assert.equal(calculateOrderTotals({ items: [{ lineTotal: 100, taxRate: 5 }], tip: 900 }).tip, 500);
});
