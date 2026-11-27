# Buyer handoff

FreshNest includes storefront and checkout, customer account, operator, seller and delivery workspaces. Operational data is stored in PostgreSQL. The catalogue images and frontend build are included. An overview of the implemented work and its checks is in QA_REPORT.md.

## Transfer checklist

- Transfer the source, relevant licences, project-specific domain assets and deployment documentation. Inventory third-party code via the npm lockfiles and installed package licence notices. Obtain catalogue image rights before commercial redistribution.
- Have the buyer provision PostgreSQL, hosting, Google OAuth, Resend, Razorpay and any geocoding accounts in their own name. Keep seller payouts, domains and merchant verification separate from the developer's personal accounts.
- Apply migrations to a clean or approved database. Seed only catalogue and default operational data. Share private customer records only through a separately authorized and lawful migration, never in the ZIP.
- Have the buyer sign in, grant roles from the server console and test one order through guest shopping, sign-in, checkout, seller packing, delivery confirmation, payment and refund. Keep provider keys in the buyer's secret store.
- Configure business policies, eligible delivery zones and fees, invoicing details and photo usage rights before launch.

## Implemented scope

The release includes public browsing, guest merge, email and Google identity, session revocation, configurable delivery zones and fees, independent stores and listings, server quotes, stock reservation, seller sub-orders, recorded commissions and manual settlements, optional idle-partner dispatch, delivery verification, in-app notifications, restock subscriptions, basic scheduled coupons and Razorpay reconciliation and refunds.

## Remaining commercial work

- Store operating-hours enforcement, warehouse lot/batch/expiry workflows, transfers, native mobile apps and independent rider jobs for each sub-order. The current delivery workflow uses a parent order with seller pickup locations.
- Independent live-map routing, background mobile GPS, production search indexing/SSR, secure support attachments and live agent chat.
- Advanced promotions such as BOGO, wallet and loyalty ledgers, subscriptions, additional business services, automated payout onboarding, and post-settlement refund adjustments.
- Legal invoicing and verified tax details, account ownership migration for legacy phone users, self-service erasure beyond the support workflow, stronger admin MFA, and organization-wide audit/compliance policies.
- Provider-owned live verification, image reuse rights, and operational reconciliation for abandoned gateway checkouts. Settlement records document externally verified payouts and do not transfer funds.
