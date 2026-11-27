# Security and release review

- Sign-in and payment endpoints validate inputs and reject untrusted roles. Google identity is verified server-side. Email codes are short-lived, single-use and stored as keyed digests with attempt and resend controls.
- Account sessions expire. Individual logout revokes a token and logout-all increments the user's version. Existing stateless tokens without a token ID are cleared across devices on their first logout.
- Razorpay webhooks are verified against the raw request body. Payment capture and refunds are fetched from Razorpay and matched to the database before recording them. Refund retries carry a stable provider idempotency key.
- Inventory changes, cart merges, order creation, cancellation, refund allocation and delivery verification use database transactions. Back-office endpoints require the relevant role and sellers can act only on their own stores.
- Use HTTPS, private environment files, an explicit allowed origin and a strong signing secret. Browser bearer tokens use the existing local-storage design. Moving to an HttpOnly cookie architecture, passkey-based admin MFA, centralized audit retention and a full third-party security review are launch work.
- The release has code-level and integration checks. It has not had an independent penetration test or infrastructure assessment. Photo rights, account deletion operations, privacy policies and verified business tax details require owner review. See QA_REPORT.md for the tested scope.

## Audit findings

The frontend npm audit returned zero advisories. The backend audit reported four high-severity entries in the Prisma 6 dependency chain, covering Prisma, @prisma/config, deepmerge-ts and effect. The project retains its tested Prisma version. Resolve and revalidate the Prisma dependency chain before a public commercial deployment.
