# Najem Store Backend

Laravel API backend for Najem Store, an Arabic-first e-commerce PWA for oud, bakhoor, perfumes, and miswak.

## Stack

- Laravel 12 API
- MySQL
- Laravel Sanctum admin tokens
- JSON responses
- Multipart image upload support
- Cash on Delivery orders stored before WhatsApp checkout

## Local Setup

```bash
cd backend
composer install
copy .env.example .env
php artisan key:generate
php artisan storage:link
php artisan migrate:fresh --seed
php artisan serve --host=127.0.0.1 --port=8000
```

Create the MySQL database first:

```sql
CREATE DATABASE najem_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

For quick local smoke tests without MySQL, you can temporarily set `DB_CONNECTION=sqlite` in `.env` and create `database/database.sqlite`.

## Default Admin

- Email: `admin@najemstore.com`
- Password: `password123`

These credentials are for local development only. Change them from the protected profile/password API before production.

## Public API

- `GET /api/categories`
- `GET /api/categories/{slug}`
- `GET /api/products`
- `GET /api/products?category=oud`
- `GET /api/products?search=keyword`
- `GET /api/products/featured`
- `GET /api/products/{id}`
- `GET /api/products/slug/{slug}`
- `GET /api/settings`
- `GET /api/social-links`
- `POST /api/orders`

## Admin API

- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/profile`
- `PUT /api/admin/profile`
- `PUT /api/admin/change-password`
- `GET /api/admin/dashboard`
- `GET|POST|PUT|DELETE /api/admin/categories`
- `GET|POST|PUT|DELETE /api/admin/products`
- `GET /api/admin/orders`
- `GET /api/admin/orders/{id}`
- `PUT /api/admin/orders/{id}/status`
- `DELETE /api/admin/orders/{id}`
- `GET /api/admin/settings`
- `PUT /api/admin/settings`
- `GET /api/admin/social-links`
- `PUT /api/admin/social-links`

Protected admin endpoints require:

```http
Authorization: Bearer <token>
Accept: application/json
```

## Order Payload

```json
{
  "customer_name": "Customer Name",
  "customer_phone": "+212600000000",
  "city": "Casablanca",
  "address": "Street address",
  "notes": "Optional",
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "slug": "oud-royal", "quantity": 1 }
  ]
}
```

The backend recalculates product prices from the database, adds the `delivery_fee` setting, stores the order and order items, reduces stock, and returns an order number plus a stored WhatsApp message.

## Images

Products and categories accept either:

- `multipart/form-data` file fields: `main_image`, `image`, `images[]`
- `image_url` fallback for external or already hosted assets

Uploaded files are stored on the public disk. Run:

```bash
php artisan storage:link
```

## Frontend Integration Notes

The product resource returns frontend-friendly aliases:

- `oldPrice`
- `isFeatured`
- `category`
- `category_slug`
- `image`

Settings and social links are database-backed and available through public endpoints so the frontend can later replace hardcoded `src/config/store.js` values.
