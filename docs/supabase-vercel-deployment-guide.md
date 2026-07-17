# MAGHRIB OUD: Supabase + Vercel Deployment Guide

This guide moves production away from the legacy Laravel backend. The Laravel backend folder stays in the repository only as legacy/reference.

## Production Architecture

- Frontend: Vercel, root directory `frontend`
- API backend: Vercel Serverless Functions in `frontend/api`
- Database: Supabase Postgres
- Storage: existing public image paths for seed data; Supabase Storage can be added later for persistent uploaded media
- Browser API base: `/api` on the same Vercel domain

## 1. Create or Open Supabase Project

Use the existing Supabase project:

- Project name: `maghrib-oud`
- Open Supabase Dashboard
- Go to SQL Editor
- Open `docs/supabase-schema.sql`
- Run the full SQL file once

The SQL creates:

- `categories`
- `products`
- `product_images`
- `orders`
- `order_items`
- `settings`
- `social_links`
- `customer_loyalty_points`
- `admins`

It also inserts starter categories, products, settings, and social links.

## 2. Admin Account Setup

The schema does not insert a plain-text default admin password.

Recommended setup:

1. Keep the `admins` table empty after running the schema.
2. Add `ADMIN_EMAIL` and `ADMIN_PASSWORD` in Vercel environment variables.
3. Deploy Vercel.
4. Log in once with those credentials.
5. The serverless API will create the first admin with a bcrypt hash.
6. After the first login works, change the password from the admin profile page.

Alternative setup:

- Generate a bcrypt hash locally.
- Insert an admin row manually in Supabase SQL Editor using the commented example at the end of `docs/supabase-schema.sql`.

Never store a real admin password in Git.

## 3. Vercel Environment Variables

Add these variables in Vercel Project Settings for the frontend project:

```env
VITE_API_URL=/api
SUPABASE_URL=https://YOUR_SUPABASE_PROJECT.supabase.co
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
ADMIN_EMAIL=YOUR_ADMIN_EMAIL
ADMIN_PASSWORD=YOUR_INITIAL_ADMIN_PASSWORD
ADMIN_TOKEN_SECRET=LONG_RANDOM_SERVER_SECRET
```

Important:

- `SUPABASE_SERVICE_ROLE_KEY` is server-only.
- Do not prefix `SUPABASE_SERVICE_ROLE_KEY` with `VITE_`.
- Do not use `SUPABASE_SERVICE_ROLE_KEY` in frontend browser code.
- `VITE_API_URL=/api` is the only browser-exposed API config.

## 4. Vercel Project Settings

Use these Vercel settings:

- Root directory: `frontend`
- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

`frontend/vercel.json` keeps `/api/*` for Vercel functions and sends non-API routes to `/index.html`, so React Router refreshes keep working.

## 5. API Routes Available

Public:

- `GET /api/categories`
- `GET /api/products`
- `GET /api/products/featured`
- `GET /api/products/:id-or-slug`
- `GET /api/products/slug/:slug`
- `GET /api/settings`
- `GET /api/social-links`
- `GET /api/loyalty-points?phone=...`
- `POST /api/orders`

Admin:

- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/profile`
- `PUT /api/admin/profile`
- `PUT /api/admin/change-password`
- `GET /api/admin/dashboard`
- `GET /api/admin/categories`
- `POST /api/admin/categories`
- `PUT /api/admin/categories/:id`
- `DELETE /api/admin/categories/:id`
- `GET /api/admin/products`
- `POST /api/admin/products`
- `GET /api/admin/products/:id`
- `PUT /api/admin/products/:id`
- `DELETE /api/admin/products/:id`
- `GET /api/admin/orders`
- `GET /api/admin/orders/:id`
- `PUT /api/admin/orders/:id/status`
- `DELETE /api/admin/orders/:id`
- `GET /api/admin/settings`
- `PUT /api/admin/settings`
- `GET /api/admin/social-links`
- `PUT /api/admin/social-links`

Responses keep the Laravel-compatible shape:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

## 6. Checkout Flow

`POST /api/orders` will:

- Validate customer name, phone, city, address, and items
- Fetch product prices from Supabase
- Calculate subtotal, Buy 2 discount, delivery fee, and total
- Generate an order number like `MO-2026-0001`
- Insert `orders` and `order_items`
- Reduce product stock
- Store expected loyalty points
- Return order totals for the WhatsApp success flow

Loyalty points are awarded when an admin changes an order status to `delivered`.

## 7. Image Handling

Seeded products and categories use public assets such as `/products/oud-royal.svg`.

Admin image upload currently accepts image files and stores small image uploads as data URLs in Supabase text fields. This keeps the dashboard working without adding Supabase Storage immediately.

For a larger production catalog, add Supabase Storage later and replace data URL handling with bucket uploads.

## 8. Deployment Steps

1. Run `docs/supabase-schema.sql` in Supabase SQL Editor.
2. Add all required Vercel environment variables.
3. Make sure `VITE_API_URL=/api`.
4. Redeploy the Vercel frontend.
5. Test `https://maghrib-oud.vercel.app/api/categories`.
6. Test admin login.
7. Test checkout from the public store.
8. Test product/category edits from the admin dashboard.

## 9. Post-Deployment Test Checklist

- Home loads without fallback notices
- `/api/categories` returns JSON
- `/api/products` returns JSON
- Product details open directly after refresh
- Cart works
- Checkout creates an order in Supabase
- WhatsApp opens with the order message
- Admin login works
- Dashboard stats load
- Product CRUD works
- Category CRUD works
- Settings update public WhatsApp number
- Order status update works
- Delivered order adds loyalty points
- Mobile and tablet layouts remain unchanged

## 10. Legacy Backend

The Laravel backend remains in `backend/` as legacy/reference. Production uses Vercel API Functions and Supabase after this migration.