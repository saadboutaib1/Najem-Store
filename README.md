# Najem Store

Najem Store is an Arabic-first e-commerce PWA for traditional oriental products: oud, bakhoor, perfumes, and miswak.

The frontend PWA has been implemented with React, Vite, React Router, RTL Arabic support, English translations, local demo products, cart persistence, and WhatsApp checkout. The backend remains in the architecture/documentation phase.

## Brand Description

Arabic:

> Najem Store هو متجر إلكتروني متخصص في أجود أنواع العود والبخور والعطور والمِسواك، يجمع بين الأصالة والفخامة ليقدّم للزبون تجربة تسوّق سهلة، راقية وموثوقة.

English:

> Najem Store is an online store specialized in premium oud, bakhoor, perfumes and miswak, combining authenticity and luxury to offer a simple, elegant and trusted shopping experience.

## Project Structure

```text
Najem-Store/
├── frontend/
│   ├── public/
│   │   ├── brand/
│   │   │   └── najem-store-logo.svg
│   │   └── pwa/
│   ├── src/
│   │   ├── app/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── features/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── types/
│   │   └── utils/
│   └── tests/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── database/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── tests/
└── docs/
    ├── api-routes.md
    ├── architecture.md
    ├── branding.md
    ├── cahier-des-charges.md
    ├── database-schema.md
    ├── development-plan.md
    └── whatsapp-checkout-flow.md
```

## Documentation

- [Cahier des charges](docs/cahier-des-charges.md)
- [Architecture](docs/architecture.md)
- [Database schema](docs/database-schema.md)
- [API routes](docs/api-routes.md)
- [Development plan](docs/development-plan.md)
- [Branding](docs/branding.md)
- [WhatsApp checkout flow](docs/whatsapp-checkout-flow.md)

## Current Phase

1. Project architecture created.
2. Documentation created.
3. Original SVG logo created.
4. Frontend PWA implemented.
5. Backend folder prepared for future implementation.

Next recommended phase: implement the backend API, database schema, admin authentication, and admin catalog/order management.
