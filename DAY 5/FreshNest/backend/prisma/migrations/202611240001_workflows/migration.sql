ALTER TABLE "Address" ADD COLUMN "archived" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Order" ADD COLUMN "addressSnapshot" JSONB, ADD COLUMN "checkoutDetails" JSONB;
UPDATE "Order" o SET "addressSnapshot" = to_jsonb(a) FROM "Address" a WHERE o."addressId" = a.id;
ALTER TABLE "SellerProduct" ADD COLUMN "approved" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
