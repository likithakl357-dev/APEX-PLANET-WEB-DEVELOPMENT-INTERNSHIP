import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { products } from '../../src/data/products.js';
import { categoryList } from '../../src/data/products.js';
const prisma = new PrismaClient();

async function main() {
  for (const c of categoryList) {
    await prisma.category.upsert({ where: { name: c.name }, update: { emoji: c.emoji, description: c.sub }, create: { name: c.name, emoji: c.emoji, description: c.sub } });
  }
  const brandNames = [...new Set(products.map(p => p.brand))];
  for (const name of brandNames) await prisma.brand.upsert({ where: { name }, update: {}, create: { name } });
  let imported = 0;
  for (const p of products) {
    const [brand, category] = await Promise.all([
      prisma.brand.findUniqueOrThrow({ where: { name: p.brand } }),
      prisma.category.findUniqueOrThrow({ where: { name: p.category } }),
    ]);
    await prisma.product.upsert({
      where: { id: p.id },
      update: {}, // preserve database edits and inactive products on re-seeding
      create: { id: p.id, name: p.name, brandId: brand.id, categoryId: category.id, unit: p.unit, price: p.price, discount: p.discount, gst: p.gst, description: p.desc, emoji: p.emoji, rating: Number(p.rating), reviews: p.reviews, tag: p.tag },
    });
    await prisma.inventory.upsert({ where: { productId: p.id }, update: {}, create: { productId: p.id, quantity: p.stock, lowStockThreshold: 10 } });
    imported++;
  }
  const coupons = [
    { code: 'FRESH50', type: 'FLAT', value: 50, minOrder: 399 },
    { code: 'NEST10', type: 'PERCENT', value: 10, maxDiscount: 100, minOrder: 299 },
    { code: 'FIRST25', type: 'PERCENT', value: 25, maxDiscount: 125, minOrder: 199 },
    { code: 'FREEDEL', type: 'FREE_DELIVERY', value: 0, minOrder: 199 },
  ];
  for (const c of coupons) await prisma.coupon.upsert({ where: { code: c.code }, update: {}, create: c });
  console.log(`Seed complete: ${imported} products, ${categoryList.length} categories, ${brandNames.length} brands.`);
}
main().catch(e => { console.error(e); process.exitCode = 1; }).finally(() => prisma.$disconnect());
