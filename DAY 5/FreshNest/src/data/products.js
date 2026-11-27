import { categories, catalog, packSizes, basePrices, brandFor, productEmojiFor } from './catalogData.js';

import { applyPhotoCatalogueDetails } from './photoCatalogueDetails.js';

// SAMPLE DATA: GST slabs per category are illustrative only (not a tax ruling).
export const GST_BY_CATEGORY = {
  'Fruits & Vegetables': 0, 'Dairy, Bread & Eggs': 5, 'Atta, Rice & Dal': 5, 'Oil, Ghee & Masala': 5,
  'Snacks & Munchies': 12, 'Sweet Tooth': 12, 'Cold Drinks & Juices': 12, 'Breakfast & Sauces': 12,
  'Instant & Frozen Food': 12, 'Bakery & Cakes': 5, 'Tea, Coffee & Health Drinks': 5, 'Dry Fruits & Nuts': 12,
  'Chocolates & Candies': 18, 'Personal Care': 18, 'Bath & Body': 18, 'Cleaning Essentials': 18,
  'Home & Kitchen': 18, 'Baby Care': 18, 'Pet Supplies': 18, 'Pooja Essentials': 12,
};

export const categoryList = categories.map(([name, emoji, sub]) => ({ name, emoji, sub }));

// Same IDs/prices/discounts as Day 3 so saved carts and wishlists keep working.
export const originallySeededProducts = categories.flatMap(([category], ci) =>
  catalog[category].map((name, i) => {
    const price = basePrices[(i * 3 + ci * 2) % basePrices.length];
    const discount = i < 2 ? 10 + i * 5 : 0;
    const stock = 8 + ((i * 7 + ci * 11) % 48);
    return {
      id: `${ci}-${i}`, name, brand: brandFor(name, category), category, price, discount,
      unit: packSizes[(i + ci) % packSizes.length], emoji: productEmojiFor(name), stock,
      rating: (4.1 + ((i + ci) % 9) / 10).toFixed(1), reviews: 20 + ((i * 13 + ci * 7) % 480),
      tag: i === 0 ? 'Bestseller' : i === 2 ? 'Popular' : 'Fresh pick',
      gst: GST_BY_CATEGORY[category] ?? 5,
      isNew: i >= 17, trending: (i + ci) % 5 === 0,
      desc: `${name} selected for your everyday needs. Carefully packed and delivered fresh.`,
      sampleData: true, // ingredients/nutrition/manufacturer are NOT provided; UI must say so
    };
  })
);
export const products = originallySeededProducts.map(applyPhotoCatalogueDetails);

// Stock demo: a handful of items are out of stock to exercise that UI.
products.forEach((p, i) => { if (i % 53 === 7) p.stock = 0; });

export const productById = Object.fromEntries(products.map(p => [p.id, p]));
export const sellPrice = p => Math.round(p.price * (1 - (p.discount || 0) / 100));
export const brands = [...new Set(products.map(p => p.brand))].sort();

// Apply the PostgreSQL catalogue response in place so existing pages/components keep their references.
export function applyServerCatalog(items = []) {
  const old = {...productById};
  products.splice(0, products.length, ...items.map(row => ({ ...old[row.id], ...row, rating: String(row.rating ?? 0), desc: row.description || old[row.id]?.desc || row.name, sampleData: true })));
  for (const id of Object.keys(productById)) delete productById[id];
  for (const p of products) productById[p.id] = p;
  brands.splice(0, brands.length, ...new Set(products.map(p => p.brand).sort()));
  for(const name of new Set(products.map(p=>p.category))) if(!categoryList.some(c=>c.name===name)) categoryList.push({name,emoji:'🛒',sub:''});
}
