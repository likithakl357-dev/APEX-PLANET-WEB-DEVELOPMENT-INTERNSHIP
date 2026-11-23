# FreshNest — Full-stack grocery storefront

FreshNest is the existing Day 5 React storefront, preserved with its cream/green design, existing routes and 400-item sample catalogue. This package adds a Node.js/Express REST API, PostgreSQL database, Prisma schema/migration, seed import, JWT authentication and persistent customer/order workflows.

## What is connected

- Backend OTP authentication and JWT sessions (development OTP is shown in the UI; no SMS is sent).
- PostgreSQL product/category/brand catalogue loaded by the frontend after login.
- Persistent cart and wishlist.
- Persistent address creation, editing and deletion.
- Server-side order pricing, coupon checks, PIN serviceability, inventory validation and transactional stock deduction.
- Customer order history and cancellation with stock restoration.
- Admin-only database metrics, order status changes, product price and inventory updates.
- Backend foundations for support tickets, returns, sellers and delivery-partner assignment/location updates.
- Product image verification metadata and safe placeholder handling.

## Run on Windows (PowerShell)

### 1. Install PostgreSQL and create a database

Install PostgreSQL 15 or later. Open pgAdmin Query Tool and execute:

```sql
CREATE DATABASE freshnest;
```

### 2. Configure and start the backend

Open PowerShell in the extracted `FreshNest-Day5` folder:

```powershell
cd backend
Copy-Item .env.example .env
notepad .env
```

Set your PostgreSQL password in `DATABASE_URL`, and replace `JWT_SECRET` with a long random value (at least 32 characters). Keep `AUTH_DEV_OTP=true` for local testing only.

Then:

```powershell
npm install
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Keep this terminal open. Backend runs at `http://localhost:4000`.

### 3. Start the frontend

Open a second PowerShell window in the project root (`FreshNest-Day5`):

```powershell
npm install
npm run dev
```

Open `http://localhost:5173`.

### 4. Sign in

Enter a valid Indian mobile number. In development, the backend generates a random four-digit OTP and displays it in the login panel. No SMS is sent. New numbers are registered as customer accounts automatically.

### 5. Enable the administrator account

After signing in once, open a third PowerShell window:

```powershell
cd backend
npm run admin:promote -- 9876543210
```

Replace the example with the mobile number used to register. Log out and sign in again, then open `http://localhost:5173/#/admin`.

## Commands

| Task | Command |
|---|---|
| Frontend dev server | `npm run dev` (project root) |
| Frontend production build | `npm run build` (project root) |
| Existing frontend tests | `npm test` (project root) |
| Image audit | `npm run images:check` (project root) |
| Backend dev server | `npm run dev` (inside `backend`) |
| Prisma client | `npx prisma generate` (inside `backend`) |
| Apply migrations | `npx prisma migrate deploy` (inside `backend`) |
| Seed catalogue | `npm run db:seed` (inside `backend`) |
| Backend pricing tests | `npm test` (inside `backend`) |

## Database and catalogue

The Prisma schema contains users, OTP records, addresses, categories, brands, products, product images, inventory, stock movements, carts, wishlists, orders, order-item price snapshots, order status history, payments, coupons, seller accounts/products/settlements, delivery assignments/location history, support tickets/messages, returns, refunds and audit logs.

The seed script imports the existing 400 catalogue entries and initial stock values. They are sample catalogue records, not a verified retailer SKU feed.

## Product photographs — honest audit

The image map is deliberately empty until a photograph has been verified against the exact product brand, variant and pack size, with source and permitted-use information recorded. Current audit: **400 products, 0 verified genuine photos, 400 safe placeholders, 0 AI-generated catalogue photos**. The original sample catalogue contains generic product labels and generated brand/pack-size assignments, so exact product matching cannot responsibly be claimed. See `image-review/IMAGE_AUDIT.md`.

## Important limitations before production

- Payment gateway integration is not active. Online UPI/card/netbanking orders are rejected by the API; choose Cash on Delivery. No fake payment success is reported.
- SMS OTP delivery is not configured. Development OTP must not be used in production.
- Only the five PIN codes from the original demo configuration are currently serviceable.
- Live GPS capture endpoints exist for authenticated delivery partners, but a live map/dispatch/WebSocket UI is not connected.
- Seller onboarding records exist, but seller management and settlements are not production-complete.
- Support and returns APIs exist; the original support UI has not yet been migrated to them.
- Fees/GST are sample configuration and require business/tax review.
- A local PostgreSQL server is required; the database is not hosted or bundled in the ZIP.

## Security notes

Never commit `.env`. Use HTTPS, a production SMS provider, a production payment gateway, real delivery-zone configuration, database backups and monitored secrets before deployment. Admin roles must only be granted by a trusted operator using the documented promotion script.
