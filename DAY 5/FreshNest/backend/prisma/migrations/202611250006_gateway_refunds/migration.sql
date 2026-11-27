ALTER TABLE "Refund" ADD COLUMN "requestKey" TEXT, ADD COLUMN "orderItemId" TEXT REFERENCES "OrderItem"("id") ON DELETE RESTRICT, ADD COLUMN "reason" TEXT, ADD COLUMN "gatewayRefundId" TEXT;
CREATE UNIQUE INDEX "Refund_requestKey_key" ON "Refund"("requestKey");
CREATE UNIQUE INDEX "Refund_gatewayRefundId_key" ON "Refund"("gatewayRefundId");
