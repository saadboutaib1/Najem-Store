# Deployment Guide

This guide describes how to deploy MAGHRIB OUD safely in production without changing the current application flow or data model.

## 1. Architecture

MAGHRIB OUD is a monorepo with two deployable applications:

- `frontend/`: React 18 + Vite single-page PWA.
- `backend/`: Laravel 12 JSON API.

Recommended production layout:

- Frontend: static hosting such as Vercel, Netlify, Cloudflare Pages, or any static web server.
- Backend: persistent PHP server or Docker container running Laravel behind HTTPS.
- Database: managed MySQL or MariaDB.
- Uploads: persistent disk on a VPS, or S3-compatible object storage for container/serverless platforms.

## 2. Detected Stack

| Area | Technology |
| --- | --- |
| Frontend | React 18, Vite, React Router, CSS |
| Backend | Laravel 12, PHP 8.2+ |
| Database | MySQL-compatible database |
| Authentication | Laravel Sanctum bearer tokens for admin API |
| Storage | Laravel filesystem, local public disk by default, S3-compatible disk supported |
| PWA | Web app manifest and custom service worker |
| Orders | Cash on delivery with generated WhatsApp message |
| Admin | Products, categories, orders, settings, promotions, loyalty, social links |

## 3. Environment Variables

### Frontend

```env
VITE_API_URL=https://your-backend-domain.com
```

`VITE_API_URL` may point to the backend origin with or without `/api`. The frontend normalizes it automatically.

For local development with the Vite proxy:

```env
VITE_API_URL=/api
VITE_API_PROXY_TARGET=http://127.0.0.1:8000
```

### Backend

Required production variables:

```env
APP_NAME="MAGHRIB OUD API"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://your-backend-domain.com
FRONTEND_URL=https://your-frontend-domain.com
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
PORT=8080

DB_CONNECTION=mysql
DB_URL=
DB_HOST=
DB_PORT=3306
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=
MYSQL_ATTR_SSL_CA=

SESSION_DRIVER=database
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax
SANCTUM_STATEFUL_DOMAINS=your-frontend-domain.com
SANCTUM_TOKEN_PREFIX=maghrib_oud_

FILESYSTEM_DISK=public
UPLOADS_DISK=public

ADMIN_SEED_NAME="MAGHRIB OUD Admin"
ADMIN_SEED_EMAIL=
ADMIN_SEED_PASSWORD=
```

Optional S3-compatible storage variables:

```env
UPLOADS_DISK=s3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=
AWS_BUCKET=
AWS_URL=
AWS_ENDPOINT=
AWS_USE_PATH_STYLE_ENDPOINT=false
```

Do not commit real `.env` files or production credentials.

## 4. Local Development

Backend:

```bash
cd backend
composer install
cp .env.example .env
# For local development, set APP_ENV=local, APP_DEBUG=true, local APP_URL/FRONTEND_URL, database values, and ADMIN_SEED_*.
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve --host=127.0.0.1 --port=8000
```

Frontend:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Local URLs:

- Frontend: `http://127.0.0.1:5173`
- Admin: `http://127.0.0.1:5173/admin/login`
- API: `http://127.0.0.1:8000/api`

## 5. Build and Start Commands

Frontend build:

```bash
cd frontend
npm run build
```

Frontend output directory:

```text
frontend/dist
```

Backend dependency install:

```bash
cd backend
composer install --no-dev --optimize-autoloader
```

Backend production optimization:

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Backend production start options:

- Recommended: serve `backend/public` with Nginx/Apache/PHP-FPM, or use `backend/Dockerfile`.
- Container start command: handled by `backend/docker/entrypoint.sh` and Apache.
- Small managed hosts may use `php artisan serve --host=0.0.0.0 --port=${PORT:-8000}`, but a real web server is preferred.

## 6. Database

Run migrations during deployment:

```bash
cd backend
php artisan migrate --force
```

Optional seed command:

```bash
php artisan db:seed --force
```

Only run the seed command after setting `ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASSWORD` if you want the seeder to create or update an admin account. Do not run `migrate:fresh`, `migrate:refresh`, `db:wipe`, or destructive seeders in production.

## 7. Health Check

The backend exposes a safe health endpoint:

```text
GET /api/health
```

Expected response:

```json
{
  "status": "ok"
}
```

The health endpoint does not expose database, credentials, hostnames, or internal paths.

## 8. CORS and Authentication

CORS is configured from environment variables:

- `FRONTEND_URL`
- `CORS_ALLOWED_ORIGINS`

Local development origins are only added when `APP_ENV` is `local` or `testing`.

Admin authentication uses Laravel Sanctum bearer tokens. Protected admin endpoints require:

```http
Authorization: Bearer <token>
Accept: application/json
```

Do not log or expose tokens in frontend code, backend logs, analytics, or support screenshots.

## 9. Product Images and Uploads

The application supports two storage modes:

### Local public disk

Use this when the backend runs on a VPS or server with persistent storage.

```env
FILESYSTEM_DISK=public
UPLOADS_DISK=public
APP_URL=https://your-backend-domain.com
```

Run:

```bash
php artisan storage:link
```

### S3-compatible storage

Use this for containers or platforms where local files are lost after redeployment.

```env
UPLOADS_DISK=s3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=
AWS_BUCKET=
AWS_URL=
AWS_ENDPOINT=
AWS_USE_PATH_STYLE_ENDPOINT=false
```

Uploads are validated as images and limited to JPG, JPEG, PNG, and WEBP up to 4 MB. Filenames are generated with UUIDs.

## 10. PWA Notes

The PWA includes:

- `frontend/public/manifest.webmanifest`
- `frontend/public/sw.js`
- `frontend/public/offline.html`
- icons under `frontend/public/pwa/`

The service worker does not cache API requests, admin routes, authentication traffic, checkout operations, orders, or loyalty lookups. Static assets are cached safely, and navigations use the network first so new deployments can update correctly.

PWA installation requires HTTPS in production.

## 11. Frontend Static Routing

React Router routes must return `index.html` after refresh. The project includes:

- `frontend/vercel.json` for Vercel rewrites.
- `frontend/public/_redirects` for Netlify and similar static hosts.

If you use another host, configure an equivalent rewrite:

```text
/* -> /index.html
```

## 12. Docker Backend Deployment

Build the backend image:

```bash
cd backend
docker build -t maghrib-oud-api .
```

Run the container:

```bash
docker run --env-file .env -p 8080:8080 maghrib-oud-api
```

For platforms that inject `PORT`, the Apache entrypoint rewrites the listen port automatically.

Migrations are not run automatically by the container. Run them once per deployment using the hosting provider shell or release command:

```bash
php artisan migrate --force
```

## 13. Recommended Deployment Steps

1. Create a production MySQL database.
2. Configure backend environment variables.
3. Configure persistent uploads through S3 or a mounted persistent disk.
4. Deploy the Laravel backend.
5. Run `php artisan migrate --force`.
6. Optionally run `php artisan db:seed --force` after setting admin seed variables.
7. Confirm `GET /api/health` returns `{ "status": "ok" }`.
8. Deploy the frontend with `VITE_API_URL` pointing to the backend origin.
9. Confirm frontend routes refresh correctly.
10. Test admin login, catalog loading, checkout, image upload, and order status updates.

## 14. Post-Deployment Checklist

- Storefront opens over HTTPS.
- `/products`, `/categories`, `/cart`, `/checkout`, `/loyalty`, `/about`, `/contact`, and `/privacy-policy` refresh without 404.
- Products and categories load from the API.
- Product details open directly by URL.
- Cart totals, Buy 2 discounts, delivery fee, and loyalty point estimates are correct.
- Checkout creates an order and opens the WhatsApp flow.
- Admin login works.
- Protected admin endpoints reject unauthenticated requests.
- Product and category image upload works.
- Uploaded images remain available after redeployment.
- Updating order status to delivered awards loyalty points.
- Language switching works in Arabic, French, and English.
- PWA manifest and service worker load without caching API responses.

## 15. Rollback

Frontend rollback:

1. Redeploy the previous static build from the hosting dashboard.
2. Keep `VITE_API_URL` unchanged unless the backend domain also changed.

Backend rollback:

1. Redeploy the previous backend image or release.
2. Do not roll back database migrations unless a tested down migration is safe for the current data.
3. If a migration must be reverted, back up the production database first.
4. Confirm `/api/health`, admin login, orders, and uploads after rollback.

## 16. Known Limitations

- The project uses WhatsApp ordering and cash on delivery; there is no online payment gateway.
- Local upload storage is not suitable for ephemeral containers unless a persistent disk is mounted.
- S3-compatible storage requires external credentials and bucket configuration.
- PWA installation and service worker behavior require HTTPS outside localhost.
- Production database credentials, domains, and storage credentials must be configured in the hosting provider dashboard.