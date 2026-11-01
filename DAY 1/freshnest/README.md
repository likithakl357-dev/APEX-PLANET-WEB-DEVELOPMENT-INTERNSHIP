# FreshNest — Organic Grocery Store

A React + Vite storefront prototype for the ApexPlanet internship project.

## Included in this starter
- Responsive home page, category browsing, product search and product cards
- Persistent shopping basket using browser LocalStorage
- Demo checkout with customer details and order confirmation
- Customer order history
- Admin area (`#admin`) with overview metrics, product management and order listing
- Responsive cream, pastel-yellow and olive-green design system

## Run locally
1. Install Node.js 20+.
2. Open a terminal in this folder.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open the local URL printed by Vite.

## Admin demo
Click **Admin** in the footer or open the app with `#admin` in the URL. This is a front-end demonstration, not secure admin authentication.

## Important prototype limitations
- Cart, catalog changes and orders are stored in the current browser's LocalStorage. They are not shared across devices or users.
- Checkout records a demo order; no payment is processed.
- There is no server-side authentication, database, inventory locking, email, or payment gateway yet.
- Before production use, connect an Express API and MongoDB, implement hashed-password authentication and role-based authorization, validate all data server-side, and integrate a payment provider in test mode before going live.
- Product artwork currently uses emoji illustrations and a few remote Unsplash photos; replace with approved product photography before final submission.
