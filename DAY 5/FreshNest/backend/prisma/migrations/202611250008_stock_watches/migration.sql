CREATE TABLE "StockWatch" ("userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE, "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE, PRIMARY KEY ("userId","productId"));
CREATE INDEX "StockWatch_productId_idx" ON "StockWatch"("productId");
ALTER TYPE "ReturnStatus" ADD VALUE 'RETURNED';
