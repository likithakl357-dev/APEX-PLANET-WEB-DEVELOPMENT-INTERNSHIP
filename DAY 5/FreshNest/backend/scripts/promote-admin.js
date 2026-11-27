import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  const email = (process.env.ADMIN_EMAIL || '')
    .trim().toLowerCase();

  if (!email) {
    throw new Error('ADMIN_EMAIL is not configured.');
  }

  const requested = process.argv[2]?.trim().toLowerCase();

  if (requested && requested !== email) {
    throw new Error('This email cannot become an administrator.');
  }

  const owner = await prisma.user.findUnique({
    where: { loginEmail: email }
  });

  if (!owner || !owner.isActive) {
    throw new Error('Authorized admin account not found or inactive.');
  }

  await prisma.$transaction([
    prisma.user.updateMany({
      where: {
        role: 'ADMIN',
        NOT: { id: owner.id }
      },
      data: {
        role: 'CUSTOMER',
        sessionVersion: { increment: 1 }
      }
    }),

    prisma.user.update({
      where: { id: owner.id },
      data: { role: 'ADMIN' }
    })
  ]);

  console.log('Single administrator configured successfully.');
  console.log('Authorized administrator:', email);

} catch (error) {
  console.error(error.message);
  process.exitCode = 1;

} finally {
  await prisma.$disconnect();
}