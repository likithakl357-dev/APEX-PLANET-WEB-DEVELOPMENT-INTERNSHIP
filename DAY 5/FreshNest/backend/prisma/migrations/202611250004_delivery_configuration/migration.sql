CREATE TABLE "DeliveryZone" ("pin" TEXT PRIMARY KEY, "area" TEXT NOT NULL, "eta" INTEGER, "serviceable" BOOLEAN NOT NULL DEFAULT true, "deliveryFee" INTEGER);
INSERT INTO "DeliveryZone" ("pin","area","eta","serviceable") VALUES
('600001','George Town, Chennai',14,true),
('600020','Adyar, Chennai',11,true),
('600040','Anna Nagar, Chennai',12,true),
('600096','Perungudi, Chennai',16,true),
('560001','MG Road, Bengaluru',15,true),
('999999','Outside service area',NULL,false);
CREATE TABLE "ShopSettings" ("id" TEXT PRIMARY KEY, "fees" JSONB NOT NULL);
CREATE TABLE "DeliveryProof" ("orderId" TEXT PRIMARY KEY REFERENCES "Order"("id") ON DELETE CASCADE, "nonce" TEXT NOT NULL, "expiresAt" TIMESTAMP(3) NOT NULL, "attempts" INTEGER NOT NULL DEFAULT 0, "confirmedAt" TIMESTAMP(3), "actorId" TEXT, "exceptionReason" TEXT);
CREATE TABLE "Notification" ("id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE, "title" TEXT NOT NULL, "message" TEXT NOT NULL, "href" TEXT, "readAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId","createdAt");
