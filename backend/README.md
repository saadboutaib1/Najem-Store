# MAGHRIB OUD Legacy Backend

This Laravel 12 backend is kept as legacy/reference code. Production now uses Vercel Serverless API Functions in `frontend/api` and Supabase Postgres.

## Stack

- Laravel 12
- PHP 8.2+
- MySQL-compatible database
- Laravel Sanctum bearer tokens
- Laravel filesystem uploads

## Local Reference Setup

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

## Production Note

Do not deploy this Laravel backend for the current production setup. Use the Vercel API functions and Supabase deployment flow documented in the root `DEPLOYMENT.md`.