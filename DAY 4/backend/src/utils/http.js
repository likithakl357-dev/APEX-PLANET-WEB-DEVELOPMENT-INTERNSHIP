export const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
export const publicProduct = p => ({
  id: p.id, name: p.name, brand: p.brand?.name, category: p.category?.name, price: p.price,
  discount: p.discount, unit: p.unit, gst: p.gst, emoji: p.emoji, rating: p.rating,
  reviews: p.reviews, tag: p.tag, description:p.description, isActive:p.isActive, stock: Math.max(0, (p.inventory?.quantity || 0) - (p.inventory?.reserved || 0)),
  image: p.images?.find(x => x.isPrimary && x.verifiedAt && x.licenseNote) || null,
});
