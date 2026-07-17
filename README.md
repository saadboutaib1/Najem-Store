# MAGHRIB OUD

MAGHRIB OUD is a full-stack web store for a Moroccan oriental products brand. The project includes a public storefront, a Laravel API, and an admin dashboard for managing the catalog, orders, store settings, promotions, loyalty points, and social links.

The store is designed around a simple flow: customers browse products, add items to the cart, send the order through WhatsApp, and pay on delivery.

## Key Features

### Storefront

- Public store built with React and Vite.
- Arabic, French, and English language support.
- RTL/LTR layout handling across the store and dashboard.
- Responsive layout for desktop, tablet, and mobile.
- Home page with video background and a clear WhatsApp ordering flow.
- Category browsing, product listing, search, product details, cart, checkout, and order success pages.
- Fixed WhatsApp button connected to the number saved in the dashboard.
- Privacy policy, about page, contact page, and social links.
- Public loyalty page where customers can check points by phone number.
- Copy is kept general so the store remains correct when categories are added or removed from the dashboard.

### Promotions and Loyalty

- Configurable "Buy 2" offer from the admin dashboard.
- Offer supports date range, discount type, and discount value.
- Discount is calculated in the cart, checkout, WhatsApp message, and backend order total.
- Loyalty points can be enabled or disabled from settings.
- Points are linked to the customer's phone number.
- Points are awarded when an order status becomes delivered.
- Rewards are calculated from dashboard settings.

### Admin Dashboard

- Secure admin login using Laravel Sanctum.
- Dashboard overview for products, categories, orders, and delivered revenue.
- Product management with Arabic, French, and English names/descriptions.
- Category management with Arabic, French, and English names/descriptions.
- Product status, stock, old price, featured products, and image management.
- Product and category image upload, change, and remove actions.
- Order management with status updates and saved WhatsApp message preview.
- Order statuses integrated with the loyalty points logic.
- Store settings for WhatsApp number, delivery fee, default language, promotions, loyalty rules, and social links.
- Admin profile page with password update.

### Backend API

- Laravel API for public store data and admin operations.
- JSON API responses with request validation.
- Database seeders for default settings, admin account, categories, products, and social links.
- Image storage through Laravel public storage.
- Public settings endpoint used by the frontend for WhatsApp, currency, delivery fee, promotions, and loyalty rules.

## Tech Stack

### Frontend

- React 18
- Vite
- React Router
- Context API
- lucide-react
- CSS

### Backend

- Laravel 12
- PHP 8.2+
- Laravel Sanctum
- MySQL
- PHPUnit

## Project Structure

```text
Maghrib-Oud/
  frontend/   React storefront and admin interface
  backend/    Laravel API, migrations, seeders, storage, and tests
  docs/       Project notes and supporting documentation
```

## Local Setup

### 1. Create the Database

```sql
CREATE DATABASE maghrib_oud CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Start the Backend

```bash
cd backend
composer install
cp .env.example .env
# Set local APP_URL, FRONTEND_URL, database values, and ADMIN_SEED_* in backend/.env.
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve --host=127.0.0.1 --port=8000
```

### 3. Start the Frontend

Open a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Default local URLs:

- Storefront: `http://127.0.0.1:5173`
- Admin login: `http://127.0.0.1:5173/admin/login`
- Backend API: `http://127.0.0.1:8000/api`

To create a seeded admin account, set `ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASSWORD` in `backend/.env` before running the seeders. Change the password from the admin account page after the first login.

## Environment

Frontend `.env`:

```env
VITE_API_URL=https://your-backend-domain.com
```

Backend `.env` values to check:

```env
APP_URL=https://your-backend-domain.com
FRONTEND_URL=https://your-frontend-domain.com
DB_CONNECTION=mysql
DB_DATABASE=maghrib_oud
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
SANCTUM_STATEFUL_DOMAINS=your-frontend-domain.com
FILESYSTEM_DISK=public
UPLOADS_DISK=public
```

## API Overview

Public endpoints:

- `GET /api/health`
- `GET /api/categories`
- `GET /api/categories/{slug}`
- `GET /api/products`
- `GET /api/products/featured`
- `GET /api/products/slug/{slug}`
- `GET /api/products/{id}`
- `GET /api/settings`
- `GET /api/social-links`
- `GET /api/loyalty-points`
- `POST /api/orders`

Admin endpoints are under `/api/admin` and require a Sanctum bearer token after login.

Main admin areas:

- `/api/admin/dashboard`
- `/api/admin/categories`
- `/api/admin/products`
- `/api/admin/orders`
- `/api/admin/settings`
- `/api/admin/social-links`
- `/api/admin/profile`

## Testing and Build

Backend tests:

```bash
cd backend
php artisan test
```

Frontend production build:

```bash
cd frontend
npm run build
```

## Notes

- Store name, currency, and country are fixed brand settings in the dashboard.
- WhatsApp number, delivery fee, default language, social links, promotions, and loyalty rules are managed from the dashboard.
- Customers do not need an account to place orders or check loyalty points; the phone number links orders to points.
- Loyalty points are awarded only after an order is marked as delivered.
- The public text avoids fixed category lists so the store remains accurate as the catalog changes.

## Documentation

- [Architecture](docs/architecture.md)
- [API routes](docs/api-routes.md)
- [Database schema](docs/database-schema.md)
- [Checkout flow](docs/whatsapp-checkout-flow.md)
- [Branding](docs/branding.md)
- [Deployment](DEPLOYMENT.md)
