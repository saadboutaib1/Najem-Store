# Development Plan - MAGHRIB OUD

## Phase 0 - Architecture And Documentation

Status: complete after this scaffold.

Deliverables:

- Root project structure.
- Frontend and backend placeholder structure.
- Documentation files.
- Branding direction.
- Original SVG logo.
- WhatsApp checkout specification.

## Phase 1 - Technical Initialization

Deliverables:

- Choose final frontend stack.
- Choose final backend stack.
- Initialize package managers and TypeScript config.
- Add linting and formatting.
- Configure environment variable examples.
- Add basic test setup.
- Add CI-ready scripts.

Recommended decisions:

- Frontend: React + TypeScript + Vite for a lean PWA, or Next.js for route-level rendering and deployment convenience.
- Backend: Node.js + TypeScript + Express/Fastify/NestJS.
- Database: PostgreSQL.
- ORM: Prisma.

## Phase 2 - Frontend PWA Shell

Deliverables:

- RTL-first layout.
- Arabic default language.
- English language switch.
- Theme tokens using MAGHRIB OUD palette.
- Responsive navigation.
- PWA manifest.
- Service worker.
- Offline fallback page.
- App icons.

## Phase 3 - Product Catalog

Deliverables:

- Home page.
- Category pages.
- Product listing.
- Product details.
- Product search.
- Product filters.
- Featured products.
- Empty/loading/error states.

## Phase 4 - Cart And Checkout

Deliverables:

- Add to cart.
- Quantity controls.
- Cart persistence.
- Subtotal calculation.
- Checkout customer form.
- Delivery fee display if available.
- Total price calculation.
- WhatsApp Business message generation.
- Cash on Delivery confirmation text.

## Phase 5 - Backend API

Deliverables:

- Public catalog routes.
- Delivery fee route.
- Optional checkout quote route.
- Optional pending order route.
- Admin auth.
- Admin product/category/order/settings APIs.
- Validation and error handling.

## Phase 6 - Database

Deliverables:

- Database schema.
- Migrations.
- Seed data for core categories.
- Seed settings and social platforms.
- Admin seed user for local development.

## Phase 7 - Admin Panel

Deliverables:

- Admin login.
- Dashboard.
- Product management.
- Category management.
- Order management.
- Delivery zone management.
- Store settings and social links.

## Phase 8 - Quality Assurance

Deliverables:

- Unit tests for cart totals.
- Unit tests for WhatsApp message generation.
- API tests for product and checkout endpoints.
- Accessibility checks.
- RTL/LTR visual checks.
- PWA installability test.
- Mobile viewport tests.

## Phase 9 - Deployment

Deliverables:

- Production environment variables.
- Frontend deployment.
- Backend deployment.
- Database deployment.
- Domain and HTTPS.
- Monitoring and logs.
- Backup plan.

## Phase 10 - Future Native Mobile App

Deliverables after web validation:

- Define mobile app requirements.
- Reuse backend APIs.
- Reuse product and checkout rules.
- Add customer accounts if needed.
- Add push notifications if needed.
- Keep WhatsApp checkout available.

## Suggested Milestones

1. Architecture approved.
2. UI direction approved.
3. PWA shell implemented.
4. Product catalog connected.
5. Cart and WhatsApp checkout working.
6. Backend and database connected.
7. Admin panel working.
8. Production deployment ready.
