ALTER TABLE "User" ADD COLUMN "avatarUrl" TEXT, ADD COLUMN "sessionVersion" INTEGER NOT NULL DEFAULT 0;
CREATE TABLE "RevokedSession" ("id" TEXT PRIMARY KEY, "expiresAt" TIMESTAMP(3) NOT NULL);
CREATE INDEX "RevokedSession_expiresAt_idx" ON "RevokedSession"("expiresAt");
CREATE TABLE "GuestCartMerge" ("userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE, "mergeId" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY ("userId","mergeId"));
