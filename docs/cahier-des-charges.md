# Cahier Des Charges - Najem Store

## 1. Project Overview

Najem Store is an Arabic-first e-commerce Web App/PWA for traditional oriental products:

- العود
- البخور
- العطور
- المسواك

Arabic description:

> Najem Store هو متجر إلكتروني متخصص في أجود أنواع العود والبخور والعطور والمِسواك، يجمع بين الأصالة والفخامة ليقدّم للزبون تجربة تسوّق سهلة، راقية وموثوقة.

English description:

> Najem Store is an online store specialized in premium oud, bakhoor, perfumes and miswak, combining authenticity and luxury to offer a simple, elegant and trusted shopping experience.

The app will be a web application with PWA capabilities. A native mobile app is not part of the first release.

## 2. Main Objectives

- Build a luxury, trustworthy Arabic storefront.
- Make browsing oriental products simple and elegant.
- Support RTL Arabic by default and English as a secondary language.
- Allow customers to place orders through WhatsApp Business.
- Avoid online payment in the first release.
- Prepare a scalable architecture for future admin, analytics, and mobile app expansion.

## 3. Target Users

- Customers looking for premium oud, bakhoor, perfumes, and miswak.
- Arabic-speaking shoppers who expect RTL navigation and Arabic content.
- Store administrators who need to manage products, orders, categories, and stock.
- Future mobile users once the business validates demand.

## 4. Scope Of Version 1

### Customer Features

- Home page with brand introduction and featured products.
- Product categories for oud, bakhoor, perfumes, and miswak.
- Product listing with search and filters.
- Product details with images, price, description, category, and stock state.
- Cart with quantity management.
- Checkout form collecting:
  - customer name
  - phone number
  - city
  - address
- WhatsApp Business order generation.
- Cash on Delivery as the only payment method.
- Arabic and English language switch.
- Social media links:
  - WhatsApp Business
  - Facebook
  - Instagram
  - TikTok
  - YouTube
- PWA installation support.

### Admin Features

- Admin authentication.
- Product CRUD.
- Category management.
- Order list and order details.
- Order status management.
- Delivery fee management by city or region.
- Basic dashboard with order and catalog summaries.

### Out Of Scope For Version 1

- Online card payment.
- Native iOS or Android app.
- Multi-vendor marketplace features.
- Advanced loyalty system.
- Complex warehouse management.

## 5. User Journey

1. The user opens Najem Store.
2. The interface loads in Arabic with RTL layout.
3. The user explores categories or searches for products.
4. The user opens a product detail page.
5. The user adds products to the cart.
6. The user reviews quantities and subtotal.
7. The user enters name, phone, city, and address.
8. The app calculates delivery fee if configured.
9. The user clicks "Commander via WhatsApp".
10. The app opens WhatsApp with a clean pre-filled order message.
11. The store confirms the order manually through WhatsApp Business.
12. The customer pays by Cash on Delivery.

## 6. Admin Journey

1. The admin logs in through a protected admin panel.
2. The admin creates or edits categories.
3. The admin adds product information:
   - Arabic name
   - English name
   - Arabic description
   - English description
   - price
   - stock quantity
   - category
   - images
   - visibility status
4. The admin reviews incoming order records if backend order capture is enabled.
5. The admin updates order status:
   - pending
   - confirmed
   - preparing
   - shipped
   - delivered
   - cancelled
6. The admin manages delivery fees and social links.

## 7. Frontend Pages

- `/`: home page
- `/products`: product listing
- `/products/:slug`: product detail
- `/categories/:slug`: category listing
- `/cart`: cart page
- `/checkout`: checkout form and WhatsApp handoff
- `/about`: brand story
- `/contact`: contact and social media links
- `/admin/login`: admin login
- `/admin`: admin dashboard
- `/admin/products`: product management
- `/admin/categories`: category management
- `/admin/orders`: order management
- `/admin/settings`: store settings

## 8. Backend Capabilities

- Public product catalog API.
- Category API.
- Delivery fee API.
- Optional order capture before WhatsApp redirect.
- Admin authentication and authorization.
- Admin product/category/order/settings APIs.
- Validation, error handling, logging, and rate limiting.

## 9. WhatsApp Checkout Requirements

The WhatsApp message must include:

- customer name
- phone number
- city
- address
- selected products
- quantities
- unit prices
- subtotal
- delivery fee if available
- total price
- payment method: Cash on Delivery

The message must be URL encoded and opened through the WhatsApp Business number using `https://wa.me/{phone}?text={message}`.

## 10. PWA Requirements

- Installable web app.
- `manifest.webmanifest`.
- Service worker for caching static assets and selected public catalog data.
- Offline fallback page.
- App icons in multiple sizes.
- Theme color based on the Najem Store luxury palette.
- Mobile-first responsive layout.
- RTL-first rendering.

## 11. Deployment Plan

- Frontend: Vercel, Netlify, or a static hosting provider with HTTPS.
- Backend: Render, Railway, Fly.io, VPS, or Vercel Functions depending on chosen stack.
- Database: managed PostgreSQL/MySQL or a VPS-hosted database.
- Media storage: Cloudinary, S3-compatible storage, or local storage for early testing.
- Domain: connect custom domain with HTTPS.
- Monitoring: application logs, uptime checks, and error tracking.

## 12. Future Native Mobile App Plan

After the PWA is validated:

- Reuse backend APIs.
- Reuse product, cart, and checkout business rules.
- Build React Native, Flutter, or native Swift/Kotlin app.
- Add push notifications.
- Add saved addresses.
- Add richer customer account features.
- Keep WhatsApp and Cash on Delivery as supported checkout paths.
