# Development handoff

## Existing PostgreSQL installations

1. Back up the database with PostgreSQL's `pg_dump -Fc` and retain the original project and environment file separately. Verify that the backup can be restored into an isolated database.
2. Compare `npm run db:deploy` migration history in a restored copy first. The initial migration in the supplied archive had an invalid SellerProduct constraint declaration. The release corrects that declaration for blank databases. If your database tracks an earlier locally corrected variant, retain the previously applied migration file from that installation to keep its checksum. Investigate failed or missing migration records against the restored copy before changing live migration history.
3. Generate Prisma Client and deploy the migrations. The new order migration adds a nullable idempotency key and a unique index scoped to the customer. Existing rows retain null keys. Seeding inserts missing catalogue and coupon records while preserving existing products, inventory quantities and coupon settings.

## Workspaces

Register a local test account first. In the backend folder use `npm run admin:promote -- you@example.com` for an administrator, or `npm run delivery:promote -- you@example.com` for a delivery partner. Sign in again to see the workspace. The admin can manage stock, orders, assignments, seller approvals, listings, returns, refunds and support tickets. Sellers apply from Sell on FreshNest and receive access after approval.

The store controls order status. COD remains pending until delivery is recorded. The delivery workspace can report the current device position on request. The customer sees the last reported position and recorded order status. Manual refunds require confirmation and a reference from the operator.

## Release boundaries

- Local test codes are available only in development. Configure Resend or Google for live sign-in. See [provider setup](PROVIDER_SETUP.md).
- Inventory is centralized and service areas are configured in source. Store-specific inventory, automatic dispatch and continuous GPS tracking remain outside this release.
- All 400 catalogue listings have user-supplied photos. Photo origins and reuse permissions are unverified. Supply the exact pack photo and verified usage rights before publishing product photography.
- Delivery slots are customer requests. SMS and push delivery, advanced promotions, seller payouts and item-level returns are unavailable. Support tickets accept text. Account deletion requests are routed to the admin support queue for manual handling.
- GST is illustrative. Review business terms, tax rates, privacy procedures, delivery coverage and payment collection before commercial deployment. Prisma 6 toolchain advisories remain open in the dependency audit.
- For a deployment, run `npm run build`, serve `dist` over HTTPS, set `VITE_API_URL` before building, and place the Express API behind an HTTPS proxy with an explicit `CORS_ORIGIN`. Use a managed PostgreSQL backup schedule and keep the API database account and secrets outside the archive. Monitor `/api/health`, server errors and backups. Disable `AUTH_DEV_OTP` on any public service.

## Catalogue update for an existing database

From the backend folder, run `npm run db:deploy` against your existing FreshNest database, then restart the app. The new migration updates original seeded product names, brands, quantities and descriptions where the original values still match. It keeps product IDs, prices, inventory and historical order snapshots. A listing with a custom name or brand may need manual review before its catalogue photo appears. For a new database, run `npm run db:seed` after the migrations.

