# FreshNest — Organic Grocery Store

**Tagline:** From Our Farm to Your Home.

FreshNest is a responsive organic grocery store prototype built with **React** and **Vite**, using a cream, pastel-yellow, and olive-green visual theme.

## Features

- Responsive storefront and product browsing
- Product category filtering and search
- Shopping basket with quantity controls
- Demo checkout and order confirmation
- Customer order history
- Admin dashboard demo with overview, product management, and order listing
- Browser LocalStorage persistence for demo data

## Tech stack

- React
- Vite
- JavaScript
- CSS
- Lucide React icons

## Run the project locally

### Requirements
- Node.js 20 or later
- npm

### Installation

1. Download or clone this repository.
2. Open a terminal in the project folder.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL printed in the terminal (usually `http://localhost:5173`).

### Production build

```bash
npm run build
```

The production-ready files will be generated in the `dist/` folder.

## Admin demo

Use the **Admin** link in the website footer, or open the app with `#admin` at the end of its URL.

> The admin area is a front-end demonstration only. It does not currently include secure admin authentication.

## Project structure

```text
FreshNest/
├── index.html
├── package.json
├── README.md
├── .gitignore
└── src/
    ├── main.jsx
    └── style.css
```

## Prototype limitations

- Cart, product changes, and orders are stored in the current browser's LocalStorage. They are not shared between users or devices.
- Checkout creates a demo order; no payment is processed.
- There is no backend API, database, secure authentication, or server-side inventory management yet.
- Product illustrations currently use emoji and some remote imagery. Replace these with approved product photography before production.

## Next development phase

The planned next phase is to connect an Express backend and MongoDB, add secure customer/admin authentication, and implement server-side product, inventory, and order APIs.
