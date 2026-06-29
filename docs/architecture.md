# Architecture - Najem Store

## 1. Architecture Goal

Najem Store should start as a clean Web App/PWA with a clear separation between frontend, backend, database, and external communication channels.

The architecture must support:

- Arabic-first RTL storefront.
- English translation support.
- Product catalog browsing.
- Cart and checkout.
- WhatsApp Business order handoff.
- Admin management.
- Future native mobile app clients.

## 2. High-Level System

```text
Customer Browser / PWA
        |
        | HTTPS
        v
Frontend Web App
        |
        | REST API / JSON
        v
Backend API
        |
        | ORM / SQL
        v
Database

External:
- WhatsApp Business deep link for checkout
- Social media links
- Optional image storage service
```

## 3. Recommended Technology Direction

The stack should remain flexible until implementation begins. A professional default would be:

- Frontend: React + TypeScript + Vite or Next.js.
- Styling: CSS variables, modern CSS, or Tailwind CSS with RTL support.
- State: lightweight store for cart, language, and UI preferences.
- Backend: Node.js + TypeScript with Express, Fastify, or NestJS.
- Database: PostgreSQL or MySQL.
- ORM: Prisma or another migration-first ORM.
- Validation: schema validation for API inputs.
- Authentication: admin-only auth using secure sessions or JWT.

## 4. Frontend Structure

```text
frontend/
├── public/
│   ├── brand/
│   └── pwa/
├── src/
│   ├── app/
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   └── layout/
│   ├── features/
│   │   ├── catalog/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── i18n/
│   │   └── pwa/
│   ├── layouts/
│   ├── pages/
│   ├── services/
│   ├── styles/
│   ├── types/
│   └── utils/
└── tests/
```

### Frontend Responsibilities

- Render the Arabic-first customer experience.
- Switch language between Arabic and English.
- Load product/category data from the backend.
- Manage cart state locally.
- Validate checkout form fields.
- Generate WhatsApp order text.
- Open WhatsApp Business checkout link.
- Provide installable PWA behavior.

## 5. Backend Structure

```text
backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── middlewares/
│   ├── models/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   └── utils/
└── tests/
```

### Backend Responsibilities

- Serve product, category, and store setting data.
- Validate and store orders if order capture is enabled.
- Manage admin authentication and permissions.
- Provide admin CRUD APIs.
- Calculate delivery fees when city-based rules exist.
- Keep business logic independent from frontend rendering.

## 6. Data Flow

### Product Browsing

1. Frontend requests categories and products.
2. Backend returns active categories and visible products.
3. Frontend renders localized content based on selected language.

### Cart

1. User adds a product to cart.
2. Frontend stores product ID, quantity, unit price snapshot, and title snapshot.
3. Cart totals are recalculated on every quantity change.
4. Cart persists in browser storage for convenience.

### Checkout

1. User submits customer details.
2. Frontend validates required fields.
3. Frontend requests delivery fee by city if backend supports it.
4. Frontend builds a WhatsApp message.
5. Optional: backend stores a draft order before redirect.
6. WhatsApp opens with the generated message.

## 7. Internationalization

Arabic is the default language.

- Default document direction: `rtl`.
- English document direction: `ltr`.
- Product content should have Arabic and English fields.
- UI labels should live in translation dictionaries.
- Currency and numbers should be formatted according to the active locale.

## 8. Security Requirements

- Validate all backend inputs.
- Sanitize admin-provided text fields where needed.
- Protect admin APIs with authentication.
- Use HTTPS in production.
- Store secrets in environment variables.
- Apply rate limits to auth and public order endpoints.
- Never trust frontend totals for final backend order records.

## 9. Performance Requirements

- Optimize product images.
- Lazy-load non-critical images.
- Cache static assets through the PWA service worker.
- Use pagination or infinite loading for large catalogs.
- Keep cart logic client-side for fast interactions.

## 10. Future Mobile App Compatibility

The backend API should be client-agnostic. The same endpoints should support:

- PWA storefront.
- Future native mobile app.
- Future admin panel.
- Future integrations such as analytics, CRM, or delivery partners.
