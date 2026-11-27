# FreshNest

FreshNest is a grocery storefront and operations platform built with React, Vite, Express, Prisma and PostgreSQL. The supplied catalogue has 400 products and 400 bundled photos across 20 categories.

## Run locally on Windows

Install Node.js 22.12 or newer and PostgreSQL. Create a database named freshnest. For an existing installation, back up the database and retain the private backend environment file before upgrading.

```powershell
npm ci
Copy-Item backend/.env.example backend/.env
Set-Location backend
npm ci
```

Edit backend/.env to set DATABASE_URL and a strong JWT_SECRET. If upgrading, reuse your private backend/.env and add new settings from the template. Keep your existing provider credentials.

```powershell
npm run prisma:generate
npm run db:deploy
npm run db:seed
npm run dev
```

In a second PowerShell window at the project root:

```powershell
npm run dev -- --port 5173 --strictPort
```

Open http://localhost:5173. The API defaults to http://localhost:4000/api. Browse and add items to a guest cart without signing in. Checkout and account changes require Resend email verification or configured Google Sign-In. Cash on Delivery is available independently of Razorpay. The default PIN 600001 is serviceable in seed configuration.

## Provider and operations guides

- [Google Sign-In](GOOGLE_SIGNIN_SETUP.md), [Resend email](RESEND_SETUP.md) and [Razorpay payment setup](RAZORPAY_SETUP.md)
- [API reference](API_DOCUMENTATION.md), [deployment](DEPLOYMENT_GUIDE.md) and [database handoff](DEVELOPMENT_HANDOFF.md)
- [Buyer handoff and limits](BUYER_HANDOFF.md), [security](SECURITY_REPORT.md), [photos](IMAGE_LICENSE_REPORT.md) and [QA](QA_REPORT.md)

## Verification

Run `npm test`, `npm run images:check`, `npm --prefix backend test` and `npm run build` from the root. For backend commercial workflow QA, use a disposable database, migrate it, seed it, then run the following from backend. The fixture creates test records and substitutes provider responses in its own process.

```powershell
$env:DATABASE_URL = 'postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/freshnest_qa?schema=public'
$env:FRESHNEST_QA_CONFIRM = 'true'
node scripts/qa-commerce.mjs
Remove-Item Env:FRESHNEST_QA_CONFIRM
```
