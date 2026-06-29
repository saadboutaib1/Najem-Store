# Najem Store Backend Test Report

Date: 2026-06-29  
Backend URL: `http://127.0.0.1:8000`  
Environment: Laravel API, MySQL via local XAMPP

## Backend Status

Status: Passed local validation.

The Laravel backend is installed, configured, migrated, seeded and running locally. Public catalog APIs, order creation, admin authentication, protected routes, CORS and validation errors were tested.

## Database Status

Database connection: MySQL  
Database name: `najem_store`  
Host: `127.0.0.1`  
Port: `3306`  
Username: `root`

Database counts after validation:

| Table | Count |
| --- | ---: |
| admins | 1 |
| categories | 4 |
| products | 12 |
| orders | 2 |
| order_items | 2 |
| settings | 11 |
| social_links | 5 |

## Migrations Status

Command run:

```bash
php artisan migrate:fresh --seed
```

Result: Passed.

Created tables include:

- `admins`
- `categories`
- `products`
- `product_images`
- `orders`
- `order_items`
- `settings`
- `social_links`
- Laravel support tables: `users`, `cache`, `jobs`, `personal_access_tokens`

## Seeders Status

Result: Passed.

Seeded data:

- Default admin account
- 4 categories: `العود`, `البخور`, `العطور`, `المسواك`
- 12 demo products
- Default settings including WhatsApp number, currency, delivery fee and default language
- 5 social links: WhatsApp, Facebook, Instagram, TikTok, YouTube

## Tested Public Endpoints

| Endpoint | Result |
| --- | --- |
| `GET /api/categories` | Passed, returned 4 categories |
| `GET /api/categories/{slug}` | Passed |
| `GET /api/products` | Passed, returned 12 products |
| `GET /api/products?category=oud` | Passed, returned 3 oud products |
| `GET /api/products?search=عود` | Passed |
| `GET /api/products/featured` | Passed, returned featured products |
| `GET /api/products/{id}` | Passed |
| `GET /api/products/slug/{slug}` | Passed |
| `GET /api/settings` | Passed |
| `GET /api/social-links` | Passed |
| `POST /api/orders` | Passed |

Product responses include frontend-compatible fields:

- `id`
- `name_ar`
- `name_en`
- `slug`
- `category`
- `category_slug`
- `description_ar`
- `description_en`
- `price`
- `oldPrice`
- `stock`
- `image`
- `rating`
- `isFeatured`
- `status`

## Admin Login Result

Endpoint:

```http
POST /api/admin/login
```

Result: Passed.

Default local admin:

```text
email: admin@najemstore.com
password: password123
```

The response returned admin data and a Sanctum bearer token.

## Protected Route Security Result

Endpoint:

```http
GET /api/admin/dashboard
```

Without token: Passed, returned `401 Unauthorized`.  
With bearer token: Passed, returned dashboard statistics:

- total products
- total categories
- total orders
- pending orders
- delivered orders
- total revenue

## Order Creation Result

Endpoint:

```http
POST /api/orders
```

Test body:

```json
{
  "customer_name": "Ali Test",
  "customer_phone": "0600000000",
  "city": "Settat",
  "address": "Hay Salam, Settat",
  "notes": "Test order from backend validation",
  "items": [
    {
      "product_id": 1,
      "quantity": 1
    }
  ]
}
```

Result: Passed.

Observed response:

- `success: true`
- order number generated, example: `NS-2026-0002`
- `subtotal: 420`
- `delivery_fee: 30`
- `total: 450`
- `payment_method: cash_on_delivery`
- `status: pending`
- `whatsapp_message_ready: true`
- order item stored
- product stock reduced

## Admin Orders Result

Protected endpoints tested with bearer token:

| Endpoint | Result |
| --- | --- |
| `GET /api/admin/orders` | Passed |
| `GET /api/admin/orders/{id}` | Passed |
| `PUT /api/admin/orders/{id}/status` | Passed, status updated to `confirmed` |

## Validation Errors Result

| Test | Result |
| --- | --- |
| Empty `POST /api/orders` body | Passed, returned `422` with validation errors |
| Wrong admin login | Passed, returned `401` |
| Wrong current password for change password | Passed, returned `422` |

## CORS Status

Configured origins:

- `http://localhost:5173`
- `http://127.0.0.1:5173`

OPTIONS checks returned `204` and allowed the matching origin for both frontend URLs.

## Automated Tests

Command run:

```bash
php artisan test
```

Result:

```text
Tests: 5 passed (70 assertions)
```

## Errors Found

1. `.env` was still configured for SQLite.
   - Fixed by setting local MySQL variables for `najem_store`.

2. `php artisan optimize:clear` failed before migrations because `CACHE_STORE=database` required the `cache` table before it existed.
   - Fixed by setting `CACHE_STORE=file` in `.env` and `.env.example`.

3. Protected admin routes without token returned `500` if the request did not send `Accept: application/json`.
   - Fixed by disabling guest redirects for this API backend and returning JSON `401`.

4. Validation errors used Laravel's default JSON shape.
   - Fixed by returning a consistent API response with `success: false`, `message` and `errors`.

5. `php artisan tinker` could not be used in this sandbox because PsySH tried to write history outside the workspace.
   - No backend code change needed. MySQL CLI was used for database counts instead.

## Fixes Applied

Files changed:

- `.env`
- `.env.example`
- `bootstrap/app.php`
- `tests/Feature/ApiSmokeTest.php`

Why:

- Match the requested MySQL local environment.
- Make first-time setup commands work cleanly.
- Ensure API-only authentication errors return JSON.
- Ensure validation errors follow the backend response format.
- Add stronger backend smoke tests for public APIs, admin security and orders.

## Remaining Issues

No backend code issues are currently blocking local development.

Notes:

- XAMPP MySQL must be running before running migrations or serving the backend.
- `php artisan storage:link` reported that the link already exists, which is OK.

## Commands To Run Backend Locally

From the project root:

```bash
cd backend
composer install
```

If `.env` does not exist:

```bash
copy .env.example .env
```

Create the local database if needed:

```bash
C:\xampp\mysql\bin\mysql.exe -u root -e "CREATE DATABASE IF NOT EXISTS najem_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Then run:

```bash
php artisan key:generate
php artisan optimize:clear
php artisan migrate:fresh --seed
php artisan storage:link
php artisan serve --host=127.0.0.1 --port=8000
```

Backend URL:

```text
http://127.0.0.1:8000
```

## Next Step: Connect Frontend With Backend

Next, update the frontend to read from the backend API instead of demo data:

- Load products from `GET /api/products`
- Load featured products from `GET /api/products/featured`
- Load categories from `GET /api/categories`
- Load settings/social links from `GET /api/settings` and `GET /api/social-links`
- Submit checkout to `POST /api/orders`
- After successful order creation, generate/open WhatsApp using the returned order data and settings
