import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const phone = process.argv[2];
if (!/^[6-9]\d{9}$/.test(phone || '')) { console.error('Usage: npm run delivery:promote -- 9876543210'); process.exitCode = 1; }
else { try { const user = await prisma.user.update({ where: { phone }, data: { role: 'DELIVERY_PARTNER' } }); console.log(`Delivery partner role granted to account ending ${user.phone.slice(-4)}.`); } catch { console.error('User not found. Register through OTP login first.'); process.exitCode = 1; } }
await prisma.$disconnect();
