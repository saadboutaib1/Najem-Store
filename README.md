# MAGHRIB OUD

MAGHRIB OUD is an e-commerce PWA for a Moroccan oriental products brand. The production app now runs as a Vercel project with React/Vite on the frontend, Vercel Serverless API functions, and Supabase Postgres for data.

The public store keeps the same customer flow: browse products, add items to the cart, send the order through WhatsApp, and pay on delivery. The admin dashboard manages products, categories, orders, store settings, promotions, loyalty points, and social links.

## Production Architecture

- Frontend: Vercel, root directory `frontend`
- API backend: Vercel Serverless Functions in `frontend/api`
- Database: Supabase Postgres
- Storage: current seed images use public frontend assets; Supabase Storage can be added later for persistent uploaded media
- Legacy reference: `backend/` keeps the previous Laravel API code for reference only and is not used for production hosting

## Key Features

### Storefront

- React + Vite public store.
- Arabic, French, and English language support.
- RTL/LTR layout handling across the store and dashboard.
- Responsive layout for desktop, tablet, and mobile.
- Home page with video background and WhatsApp ordering flow.
- Category browsing, product listing, search, product details, cart, checkout, and order success pages.
- Fixed WhatsApp button connected to the number saved in settings.
- Privacy policy, about page, contact page, and social links.
- Public loyalty page where customers can check points by phone number.

### Promotions and Loyalty

- Configurable Buy 2 offer from the admin dashboard.
- Offer supports date range, discount type, and discount value.
- Discount is calculated in cart, checkout, WhatsApp message, and API order total.
- Loyalty points can be enabled or disabled from settings.
- Points are linked to the customer's phone number.
- Points are awarded when an order status becomes delivered.

### Admin Dashboard

- Admin login through the Vercel API.
- Signed admin token stored by the existing dashboard session flow.
- Dashboard overview for products, categories, orders, and delivered revenue.
- Product and category CRUD with Arabic, French, and English fields.
- Product status, stock, old price, featured products, and image management.
- Order management with status updates and saved WhatsApp message preview.
- Store settings for WhatsApp number, delivery fee, default language, promotions, loyalty rules, and social links.
- Admin profile page with password update.

## Tech Stack

### Production

- React 18
- Vite
- React Router
- Vercel Serverless Functions
- Supabase Postgres
- Supabase JavaScript client
- bcryptjs for admin password hashes

### Legacy Reference

- Laravel backend remains in `backend/` as reference only.

## Project Structure

```text
Maghrib-Oud/
  frontend/   React storefront, admin interface, and Vercel API functions
  backend/    Legacy Laravel API reference
  docs/       Supabase schema and deployment documentation
```

## Local Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

For production-like local serverless API testing, use Vercel CLI from `frontend/` with the Supabase server environment variables configured locally.

Default local frontend URL:

```text
http://127.0.0.1:5173
```

## Environment

Frontend/Vercel variables:

```env
VITE_API_URL=/api
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=server_only_do_not_expose
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
ADMIN_TOKEN_SECRET=your_admin_token_secret
```

Only `VITE_API_URL` is browser-facing. Supabase and admin variables are server-only Vercel variables and must never be exposed in browser code.

## API Overview

Public endpoints:

- `GET /api/categories`
- `GET /api/products`
- `GET /api/products/featured`
- `GET /api/products/:id-or-slug`
- `GET /api/products/slug/:slug`
- `GET /api/settings`
- `GET /api/social-links`
- `GET /api/loyalty-points?phone=...`
- `POST /api/orders`

Admin endpoints are under `/api/admin` and require the signed bearer token returned by login.

## Build

```bash
cd frontend
npm install
npm run build
```

Production output:

```text
frontend/dist
```

## Deployment

See:

- [Deployment guide](DEPLOYMENT.md)
- [Supabase schema](docs/supabase-schema.sql)
- [Supabase + Vercel guide](docs/supabase-vercel-deployment-guide.md)

## Notes

- Do not commit `.env` files or real credentials.
- Do not commit `node_modules`, `vendor`, generated packages, or ZIP files.
- Production should use Vercel API functions and Supabase, not the legacy Laravel backend.