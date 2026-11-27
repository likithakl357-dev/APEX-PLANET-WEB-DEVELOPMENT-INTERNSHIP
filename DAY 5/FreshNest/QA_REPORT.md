# FreshNest commercial upgrade verification

The release was built on Windows and tested against a disposable PostgreSQL database. The existing operational database was not modified.

| Check | Result |
| --- | --- |
| Frontend tests and production build | 34 passed. Vite production build passed. |
| Backend tests | Five unit tests passed. The optional authorized-token integration test was skipped because separate customer tokens were not supplied. |
| Prisma | Client generated, all 11 migrations applied, product seed produced 400 listings across 20 categories. |
| PostgreSQL commercial scenario | Passed email challenge validation, Resend request, Google verified-account linking and wrong-audience rejection, logout and logout-all, concurrent guest cart merge, role boundaries, delivery zones and pricing, coupons, stock notices, two-store stock allocation and fulfilment, driver dispatch, customer-owned delivery code verification, manual settlement recording, server-side Razorpay pricing and capture reconciliation, partial refund and signed webhook replay. Provider endpoints were simulated. |
| Browser | Mobile Chrome passed public guest browsing, cart persistence, login gate, code entry, cart merge and checkout choices with controlled API responses. |
| Photo audit | The 400 mapped files were present, with no missing mapping. Earlier delivery of the same photo set verified all 400 in Chrome and checked desktop/mobile fit. |
| Dependency audit | Zero frontend advisories. Four high-severity Prisma toolchain entries remain. |

Live provider services, paid transactions, cloud deployment, browser GPS in the field, wider concurrency/load tests, completed commercial licensing and independent security assessment were outside this verification. The full gaps are in BUYER_HANDOFF.md and SECURITY_REPORT.md.
