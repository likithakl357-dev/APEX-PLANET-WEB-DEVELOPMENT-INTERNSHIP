# FreshNest backend (Node.js + Express + PostgreSQL + Prisma)

## Requirements
- Node.js 20+ and npm
- PostgreSQL 15+
- A local database named `freshnest`

## Windows PowerShell setup

From the `FreshNest-Day5` project folder:

```powershell
cd backend
Copy-Item .env.example .env
notepad .env
```

Set `DATABASE_URL` to your PostgreSQL username/password and database, and replace `JWT_SECRET` with a random secret of at least 32 characters. Keep `AUTH_DEV_OTP=true` only for local development. Do not commit `.env`.

Create the database in pgAdmin Query Tool or `psql`:

```sql
CREATE DATABASE freshnest;
```

Then run:

```powershell
npm install
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run dev
```

API: `http://localhost:4000/api`
Health: `http://localhost:4000/api/health`

## Authentication

The app uses a generated four-digit OTP, bcrypt-hashed in PostgreSQL and expiring after five minutes. No SMS is sent in development; the OTP is returned to the frontend as a development-only value. Production OTP requests return a configuration error until an SMS provider is connected. JWTs are signed using `JWT_SECRET`.

New phone numbers are registered as customer accounts at OTP verification. After creating your own account once, promote it to administrator from this folder:

```powershell
npm run admin:promote -- 9876543210
```

Replace the number with your own registered mobile number, then log out and sign in again. Do not expose this command to customers or run it on an untrusted machine.

## API overview

- `POST /auth/otp/request`, `POST /auth/otp/verify`, `GET /auth/me`, `PATCH /auth/profile`
- `GET /categories`, `GET /products`, `GET /products/:id`
- `GET /cart`, `PUT /cart/items/:productId`, `DELETE /cart/items/:productId`
- `GET /wishlist`, `PUT /wishlist/:productId`
- `GET /addresses`, `POST /addresses`, `PUT /addresses/:id`, `DELETE /addresses/:id`
- `POST /orders`, `GET /orders`, `GET /orders/:id`, `POST /orders/:id/cancel`, `POST /orders/:id/returns`
- `GET /support/tickets`, `POST /support/tickets`, `POST /support/tickets/:id/messages`
- Admin: `GET /admin/overview`, `GET /admin/orders`, `PATCH /admin/orders/:id/status`, product and inventory updates, verified image registration, seller approval and returns
- Seller: `POST /seller/apply`, `GET /seller/me`, `GET /seller/products`
- Delivery partner: assignment status and location update endpoints

All protected routes require `Authorization: Bearer <token>`. Admin and delivery-partner endpoints enforce server-side roles.

## Database

Prisma schema and the initial PostgreSQL migration are in `prisma/`. The seed imports all 400 existing sample catalogue records, their categories and brands, stock quantities and sample coupons. Re-running the seed upserts products and does not reset existing inventory quantities.

## Important operational limitations

- Online payments are deliberately blocked. The API accepts Cash on Delivery only until a real payment provider, server-side signature verification and webhook handling are configured. It never reports a simulated card/UPI payment as successful.
- SMS OTP delivery is not configured. Development OTP is only for local testing.
- Delivery PIN serviceability currently uses the five PIN codes already present in the original demo configuration. Configure real delivery zones before launch.
- Live delivery GPS endpoints store partner-supplied coordinates, but no map UI, WebSocket stream or dispatch service is connected yet.
- Seller application and core seller records exist, but seller catalogue/settlement workflows are not production-complete.
- The 400-item catalogue remains sample data. Product image audit currently reports zero verified genuine photographs; all products use safe placeholders until exact SKU images and reuse permissions are verified.
- Tax percentages and fees are sample values and must be reviewed for actual business/legal use.

## Tests

```powershell
npm test
```

The tests cover server-side order-total calculations. Database integration tests require a running PostgreSQL instance and are not included in this local-only package.
