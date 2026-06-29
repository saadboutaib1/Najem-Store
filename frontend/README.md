# Najem Store Frontend

React + Vite frontend for the Najem Store Arabic-first e-commerce PWA.

## Stack

- React
- Vite
- React Router
- Context API
- localStorage cart persistence
- Normal CSS
- PWA manifest and service worker

## Features

- RTL-first UI
- Arabic default language with English translation support
- Demo product catalog for oud, bakhoor, perfumes, and miswak
- Product details pages
- Cart add/remove/increase/decrease/clear
- Checkout form with Cash on Delivery
- WhatsApp Business checkout message generation
- Social media links
- Responsive mobile-first layout
- Local SVG brand, category, and product assets
- Catalog service layer prepared for future Laravel API integration

## Run Locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

Preview build:

```bash
npm run preview
```

## Important Files

- `src/config/store.js`: store name, WhatsApp number, social links, currency, default language
- `src/i18n/ar.js`: Arabic translations
- `src/i18n/en.js`: English translations
- `src/data/products.js`: demo products
- `src/services/catalogService.js`: catalog data access layer and future Laravel endpoints
- `src/context/CartContext.jsx`: cart state and persistence
- `src/context/LanguageContext.jsx`: language and direction handling
- `src/utils/whatsapp.js`: WhatsApp order message and URL generation
- `public/manifest.webmanifest`: PWA manifest
- `public/sw.js`: service worker

## Laravel Connection Later

For the next backend phase, set the API URL in `.env`:

```bash
VITE_API_BASE_URL=http://localhost:8000
```

Then replace the demo-data return values inside `src/services/catalogService.js` with real Laravel API calls.
