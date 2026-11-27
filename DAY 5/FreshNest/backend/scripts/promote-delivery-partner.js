import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const identifier = process.argv[2]?.trim().toLowerCase() || '';
try {
  const where = /^[6-9]\d{9}$/.test(identifier) ? { phone: identifier }
    : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier) ? { loginEmail: identifier } : null;
  if (!where) throw Error('Provide the verified account email or a legacy 10-digit phone number.');
  await prisma.user.update({ where, data: { role: 'DELIVERY_PARTNER' } });
  console.log('Account role updated. Sign in again to refresh the session.');
} catch (error) {
  console.error(error.code === 'P2025' ? 'Account not found. Sign in first, then try again.' : error.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
