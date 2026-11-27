# Deployment guide

## Infrastructure

Use a static HTTPS host for dist, a Node.js or container deployment for Express, and PostgreSQL on a private network or a managed service. Hosting, database backups, SMS, maps and other external providers may have costs. Use the providers' current pricing pages before choosing a plan.

1. Set NODE_ENV=production, AUTH_DEV_OTP=false, HOST=0.0.0.0 where the hosting service requires it, a restricted CORS_ORIGIN and a long random JWT_SECRET. Put database and provider secrets in the host's secret store. Do not expose PostgreSQL publicly unless necessary for your configuration and protected by access controls.
2. Build the frontend with VITE_API_URL set to your HTTPS API root, including /api. Configure your frontend host to serve index.html for unknown non-asset paths so product deep links open.
3. For a public sitemap, set SITE_URL to your canonical HTTPS origin and run npm run sitemap before npm run build. Serve the generated sitemap.xml and robots.txt. Product titles are updated client-side. Server-rendered product HTML and search-engine rich result eligibility are future improvements.
4. The included backend Dockerfile builds the Express image. Deploy migrations from the same release before replacing the application. Run the seed only for a new setup or when you intentionally need to insert missing catalogue records. Keep migration and application credentials limited to their tasks.
5. Configure Resend, Google and Razorpay using their setup guides. Set VITE_GEOCODE_ENDPOINT only if you operate or contract for a reverse-geocoding service. The site supports manual addresses without it.
6. Add checks for /api/live and /api/health. Monitor HTTP errors, database connection failures, webhook rejections, stale payment orders and refund discrepancies. Review provider dashboards during acceptance.

## Database recovery

Make a PostgreSQL custom-format backup with pg_dump -Fc before migrations. Restore with pg_restore into an isolated database and verify users, orders, payments, stock and migrations before deployment. Keep scheduled backups and test recovery. Rolling back application code after a migration requires checking schema compatibility. Do not restore over a live database without an explicit rollback procedure and a fresh backup.

## Mobile roadmap

Retain PostgreSQL and the API as the source of truth. A later React Native or Expo release can use its own Google OAuth clients, mobile session storage and the provider-supported mobile payment SDK. Implement customer checkout first, then partner location and seller fulfilment against the existing role-scoped routes.

Deployments, managed backup restore and live-provider acceptance must be validated in the chosen infrastructure. The supplied ZIP has no running cloud deployment.
