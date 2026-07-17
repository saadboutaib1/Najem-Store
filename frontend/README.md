# MAGHRIB OUD Frontend

React + Vite storefront, admin interface, and Vercel Serverless API for MAGHRIB OUD.

## Stack

- React 18
- Vite
- React Router
- Context API
- CSS
- PWA manifest and service worker
- Vercel Serverless Functions in `api/`
- Supabase JavaScript client for server-side API access

## Features

- Arabic, French, and English support.
- RTL/LTR layout handling.
- Public storefront, product details, cart, checkout, loyalty, contact, about, and privacy pages.
- Admin dashboard routes protected by signed API tokens.
- WhatsApp ordering flow connected to Supabase-backed settings.
- SPA deployment support through `vercel.json`.

## Environment

Production on Vercel:

```env
VITE_API_URL=/api
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=server_only_do_not_expose
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
ADMIN_TOKEN_SECRET=your_admin_token_secret
```

Only `VITE_API_URL` is browser-facing. Supabase service role and admin values are server-only Vercel variables.

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview
```

Production build output:

```text
dist/
```