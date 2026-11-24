import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const phone = process.argv[2];
if (!/^[6-9]\d{9}$/.test(phone || '')) {
  console.error('Usage: npm run admin:promote -- 9876543210');
  process.exitCode = 1;
} else {
  try {
    const user = await prisma.user.update({ where: { phone }, data: { role: 'ADMIN' } });
    console.log(`Administrator role granted to account ending ${user.phone.slice(-4)}. Log out and sign in again to refresh your session.`);
  } catch (error) {
    console.error('User not found. Sign up through FreshNest OTP login first, then run this command.');
    process.exitCode = 1;
  }
}
await prisma.$disconnect();
