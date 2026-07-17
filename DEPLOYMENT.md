# Deployment Guide

MAGHRIB OUD production now uses Vercel + Vercel Serverless API Functions + Supabase. The Laravel backend folder remains in the repository only as legacy/reference and is not part of the production deployment.

## 1. Production Architecture

- Frontend: React/Vite deployed on Vercel from `frontend/`
- API: Vercel Serverless Functions in `frontend/api`
- Database: Supabase Postgres
- Browser API base: `/api`
- Storage: public frontend image assets for seed data; Supabase Storage can be added later for persistent uploaded media

## 2. Required Vercel Environment Variables

Add these variables in Vercel Project Settings:

```env
VITE_API_URL=/api
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=server_only_do_not_expose
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
ADMIN_TOKEN_SECRET=your_admin_token_secret
```

Security notes:

- `SUPABASE_SERVICE_ROLE_KEY` is server-only.
- Do not prefix `SUPABASE_SERVICE_ROLE_KEY` with `VITE_`.
- Do not commit real values to Git.
- Only `VITE_API_URL=/api` is intended for browser code.

## 3. Supabase Setup

1. Open the Supabase project.
2. Go to SQL Editor.
3. Run `docs/supabase-schema.sql`.
4. Confirm these tables exist:
   - `categories`
   - `products`
   - `product_images`
   - `orders`
   - `order_items`
   - `settings`
   - `social_links`
   - `customer_loyalty_points`
   - `admins`
5. Confirm seed rows exist for categories, products, settings, and social links.

The schema keeps the `admins` table ready but does not store a plain-text password.

## 4. Admin Bootstrap

Recommended first admin flow:

1. Keep the `admins` table empty after running the schema.
2. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in Vercel.
3. Deploy the app.
4. Log in once with those credentials.
5. The API creates the first admin with a bcrypt hash.
6. Change the password from the admin profile page.

After the first admin exists, keep `ADMIN_PASSWORD` rotated or remove it from Vercel if you do not want bootstrap login available again. Bootstrap creation only runs when the `admins` table is empty.

## 5. Vercel Project Settings

Use these settings:

- Root directory: `frontend`
- Framework preset: Vite
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`

`frontend/vercel.json` keeps `/api/*` for serverless functions and rewrites non-API routes to `/index.html` for React Router refresh support. The app manifest is local at `/manifest.webmanifest`. Use the production domain, `https://maghrib-oud.vercel.app`, for final PWA testing; Vercel preview/protected deployments may request a Vercel SSO manifest, which is allowed only by the narrow `manifest-src` CSP entry for `https://vercel.com`.

## 6. Deployment Steps

1. Push `main` to GitHub.
2. In Supabase, run `docs/supabase-schema.sql` if it has not been run yet.
3. Add all required environment variables in Vercel.
4. Deploy the Vercel project from the `frontend` root.
5. Test public API routes.
6. Test admin login.
7. Test checkout and order creation.

## 7. API Smoke Tests

After deployment, open these URLs:

```text
https://YOUR_VERCEL_DOMAIN/api/categories
https://YOUR_VERCEL_DOMAIN/api/products
https://YOUR_VERCEL_DOMAIN/api/settings
https://YOUR_VERCEL_DOMAIN/api/social-links
```

Each should return JSON shaped like:

```json
{
  "success": true,
  "message": "...",
  "data": []
}
```

## 8. Final Live Tests

- Home loads without fallback notices.
- Products load from Supabase.
- Product details work after direct refresh.
- Cart works.
- Checkout creates an order in Supabase.
- WhatsApp opens with order details.
- Admin login works.
- Dashboard stats load.
- Products and categories can be added, edited, and deleted.
- Settings WhatsApp number updates public WhatsApp links.
- Order status update works.
- Delivered orders add loyalty points.
- Arabic, French, and English language switching keeps the layout stable.
- Mobile and tablet layouts remain responsive.

## 9. Rollback

Frontend/API rollback:

1. Redeploy a previous Vercel deployment.
2. Keep `VITE_API_URL=/api` unless the API architecture changes.
3. Do not alter Supabase data during frontend rollback unless a tested schema rollback is required.

Database rollback:

1. Back up Supabase before making schema changes.
2. Prefer forward-safe SQL fixes.
3. Avoid deleting tables or truncating production data.

## 10. Known Limitations

- Product/category image upload currently stores small uploaded images as data URLs through the serverless API. Use Supabase Storage later for larger production catalogs.
- Orders use WhatsApp and cash on delivery; no online payment gateway is configured.
- The legacy Laravel backend is not part of production deployment.