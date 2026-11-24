# FreshNest

FreshNest is a React grocery storefront with an Express API and PostgreSQL storage through Prisma. The package includes the existing 400 products, 20 categories and 105 brands.

## Run locally on Windows

Install Node.js 22.12 or newer and PostgreSQL. In PostgreSQL, create an empty database named `freshnest` for a new installation. For an existing FreshNest database, read [the migration notes](DEVELOPMENT_HANDOFF.md) first.

Open PowerShell in the extracted folder.

```powershell
npm ci
Copy-Item backend/.env.example backend/.env
```

Edit `backend/.env`. Set `DATABASE_URL` using your PostgreSQL credentials and replace `JWT_SECRET` with a unique random value of at least 32 characters. URL-encode special characters in the database password. Keep the local development sign-in settings from the example.

```powershell
Set-Location backend
npm ci
npm run prisma:generate
npm run db:deploy
npm run db:seed
npm run dev
```

In a second terminal at the extracted folder root, run:

```powershell
npm run dev -- --port 5173 --strictPort
```

Open http://localhost:5173. The API runs at http://localhost:4000/api. If 5173 is occupied, use a free frontend port and set `CORS_ORIGIN` in the backend environment to the matching frontend origin.

For local sign-in, enter a valid-format Indian mobile number and use the generated four-digit code shown on screen. No SMS service is required. Choose a serviceable PIN such as 600001 when testing checkout. Checkout uses Cash on Delivery.

## Tests

```powershell
npm test
npm run build
npm run images:check
npm --prefix backend test
```

For the database-backed integration test, use a disposable database with the catalogue seeded and the development API running. The test creates customer records, an order and a ticket.

```powershell
$env:FRESHNEST_QA_API = 'http://localhost:4000/api'
npm --prefix backend test
Remove-Item Env:FRESHNEST_QA_API
```

See [QA results](QA_REPORT.md), [API documentation](API_DOCUMENTATION.md), and [development handoff](DEVELOPMENT_HANDOFF.md).
