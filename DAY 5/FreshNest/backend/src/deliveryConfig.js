import { z } from 'zod';
import { prisma } from './db.js';
import { auth, roles } from './middleware/auth.js';
import { asyncHandler } from './utils/http.js';
import { publicCoupons } from './promotions.js';
import { FEES } from '../../src/data/config.js';

const zoneInput = z.object({ area: z.string().trim().min(2).max(150),
  eta: z.number().int().min(1).max(1440).nullable(), serviceable: z.boolean(),
  deliveryFee: z.number().int().min(0).max(10000).nullable() });
const feesInput = z.object(Object.fromEntries(Object.keys(FEES).map(key => [key, z.number().int().min(0).max(100000)])));
export async function settings(db = prisma, zone) {
  const saved = await db.shopSettings.findUnique({ where: { id: 'checkout' } });
  const fees = feesInput.safeParse(saved?.fees);
  return { ...(fees.success ? fees.data : FEES), ...(zone?.deliveryFee != null ? { deliveryFee: zone.deliveryFee } : {}) };
}
export function registerDeliveryConfig(app, parse, isOnline) {
  const allZones = () => prisma.deliveryZone.findMany({ orderBy: { pin: 'asc' } });
  app.get('/api/service-areas', asyncHandler(async (_req, res) => res.json(await allZones())));
  app.get('/api/config', asyncHandler(async (_req, res) => res.json({
    fees: await settings(), serviceAreas: await allZones(), coupons: await publicCoupons(), onlinePayments: isOnline()
  })));
  app.put('/api/admin/delivery-zones/:pin', auth, roles('ADMIN'), asyncHandler(async (req,res) => {
    const pin = parse(z.string().regex(/^\d{6}$/), req.params.pin);
    const data = parse(zoneInput, req.body);
    const row = await prisma.deliveryZone.upsert({ where: { pin }, update: data, create: { pin, ...data } });
    res.json(row);
  }));
  app.put('/api/admin/delivery-pricing', auth, roles('ADMIN'), asyncHandler(async (req,res) => {
    const fees = parse(feesInput, req.body);
    await prisma.shopSettings.upsert({ where: { id: 'checkout' }, create: { id: 'checkout', fees }, update: { fees } });
    res.json({ fees });
  }));
}
