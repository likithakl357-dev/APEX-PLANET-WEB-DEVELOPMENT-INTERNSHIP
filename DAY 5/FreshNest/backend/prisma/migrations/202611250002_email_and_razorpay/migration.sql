ALTER TYPE "PaymentMethod" ADD VALUE 'RAZORPAY';
ALTER TABLE "User" ALTER COLUMN "phone" DROP NOT NULL, ADD COLUMN "loginEmail" TEXT, ADD COLUMN "googleSubject" TEXT;
CREATE UNIQUE INDEX "User_loginEmail_key" ON "User"("loginEmail");
CREATE UNIQUE INDEX "User_googleSubject_key" ON "User"("googleSubject");
ALTER TABLE "Payment" ADD COLUMN "checkoutOrderId" TEXT;
CREATE UNIQUE INDEX "Payment_checkoutOrderId_key" ON "Payment"("checkoutOrderId");
CREATE TABLE "EmailChallenge" (
  "email" TEXT NOT NULL PRIMARY KEY,
  "codeHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "reservedAt" TIMESTAMP(3) NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "consumedAt" TIMESTAMP(3)
);
