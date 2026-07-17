# MAGHRIB OUD Backend

Laravel 12 API backend for MAGHRIB OUD.

## Stack

- Laravel 12
- PHP 8.2+
- MySQL-compatible database
- Laravel Sanctum bearer tokens for admin authentication
- Laravel filesystem uploads with local public disk or S3-compatible storage

## Local Setup

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan storage:link
php artisan migrate --seed
php artisan serve --host=127.0.0.1 --port=8000
```

Create the MySQL database first:

```sql
CREATE DATABASE maghrib_oud CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Set `ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASSWORD` before running seeders if you want a local admin account created automatically.

## Production

Use a persistent PHP server or the included Dockerfile. Do not run destructive migration commands in production.

```bash
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Health endpoint:

```text
GET /api/health
```

## Public API

- `GET /api/health`
- `GET /api/categories`
- `GET /api/categories/{slug}`
- `GET /api/products`
- `GET /api/products/featured`
- `GET /api/products/{id}`
- `GET /api/products/slug/{slug}`
- `GET /api/settings`
- `GET /api/social-links`
- `GET /api/loyalty-points`
- `POST /api/orders`

## Admin API

Admin endpoints are under `/api/admin` and require:

```http
Authorization: Bearer <token>
Accept: application/json
```

See the root `DEPLOYMENT.md` for production environment variables, storage configuration, and deployment steps.