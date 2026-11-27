// All values below are MOCK configuration. Replace with API responses in the backend stage.
export const FEES = { freeDeliveryAbove: 499, deliveryFee: 25, handling: 5, smallCartBelow: 99, smallCartFee: 20, giftPacking: 40, minOrder: 49 };

export const SERVICE_AREAS = [
  { pin: '600001', area: 'George Town, Chennai', eta: 14, serviceable: true },
  { pin: '600020', area: 'Adyar, Chennai', eta: 11, serviceable: true },
  { pin: '600040', area: 'Anna Nagar, Chennai', eta: 12, serviceable: true },
  { pin: '600096', area: 'Perungudi, Chennai', eta: 16, serviceable: true },
  { pin: '560001', area: 'MG Road, Bengaluru', eta: 15, serviceable: true },
  { pin: '999999', area: 'Remote area (demo: not serviceable)', eta: null, serviceable: false },
];

export const COUPONS = [
  { code: 'FRESH50', title: '₹50 off on orders above ₹399', type: 'flat', value: 50, min: 399 },
  { code: 'NEST10', title: '10% off up to ₹100 on orders above ₹299', type: 'percent', value: 10, max: 100, min: 299 },
  { code: 'FIRST25', title: 'First order: 25% off up to ₹125', type: 'percent', value: 25, max: 125, min: 199, firstOrderOnly: true },
  { code: 'FREEDEL', title: 'Free delivery on orders above ₹199', type: 'freedelivery', value: 0, min: 199 },
];

export const BANK_OFFERS = [
  { id: 'b1', text: '5% cashback up to ₹75 with Demo Bank cards (sample offer)' },
  { id: 'b2', text: '₹30 cashback on first UPI payment (sample offer)' },
];

export const PAYMENT_METHODS = [
  ['UPI', '📱', 'Pay using any UPI app'], ['Card', '💳', 'Credit or debit card'], ['Net banking', '🏦', 'Pay via your bank'],
  ['Wallet', '👛', 'FreshNest demo wallet'], ['Cash on Delivery', '💵', 'Pay when your order arrives'],
];

export const ORDER_STAGES = [
  ['Order placed', 'We have received your order.'], ['Order confirmed', 'The store has accepted your order.'],
  ['Preparing your order', 'The store team is picking your items.'], ['Packed', 'Your order is packed and sealed.'],
  ['Delivery partner assigned', 'A delivery partner is heading to the store.'], ['Out for delivery', 'Your order is on its way.'],
  ['Delivered', 'Enjoy your FreshNest order!'],
];
// Policy (sample, not legal wording): cancellation allowed only up to this stage index (exclusive).
export const CANCEL_ALLOWED_BEFORE_STAGE = 3;
