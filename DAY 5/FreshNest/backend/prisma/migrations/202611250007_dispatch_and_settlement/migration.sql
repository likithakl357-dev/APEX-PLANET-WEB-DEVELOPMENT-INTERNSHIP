ALTER TABLE "User" ADD COLUMN "deliveryAvailable" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "SellerOrder" ADD COLUMN "settlementRef" TEXT, ADD COLUMN "settledAt" TIMESTAMP(3), ADD COLUMN "settledAmount" INTEGER;
CREATE UNIQUE INDEX "SellerOrder_settlementRef_key" ON "SellerOrder"("settlementRef");
