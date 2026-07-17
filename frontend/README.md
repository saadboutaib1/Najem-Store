# MAGHRIB OUD Frontend

React + Vite storefront and admin interface for MAGHRIB OUD.

## Stack

- React 18
- Vite
- React Router
- Context API
- CSS
- PWA manifest and service worker

## Features

- Arabic, French, and English support.
- RTL/LTR layout handling.
- Public storefront, product details, cart, checkout, loyalty, contact, about, and privacy pages.
- Admin dashboard routes protected by backend-issued Sanctum bearer tokens.
- WhatsApp ordering flow connected to backend settings.
- Static SPA deployment support through `vercel.json` and `_redirects`.

## Environment

Production:

```env
VITE_API_URL=https://your-backend-domain.com
```

Local Vite proxy:

```env
VITE_API_URL=/api
VITE_API_PROXY_TARGET=http://127.0.0.1:8000
```

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