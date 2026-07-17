# Security Audit

## 1. Detected architecture

- Frontend: React 18, Vite 8, React Router SPA/PWA.
- Backend: Laravel 12 API running on PHP 8.2+.
- Database: MySQL-compatible schema managed by Laravel migrations; tests use SQLite in memory.
- Authentication: Laravel Sanctum bearer tokens for the admin API.
- Authorization model: all `/api/admin/*` routes require `auth:sanctum` plus the `admin.active` middleware. Public storefront routes do not expose admin operations.
- Storage: Laravel filesystem, `UPLOADS_DISK` for product/category uploads. Local public disk remains available for development; S3-compatible storage is supported for production.
- PWA: static manifest and custom service worker in `frontend/public`.
- Ordering flow: checkout creates backend orders and prepares a WhatsApp confirmation message. The backend recalculates prices, discounts, shipping, totals, and stock.

## 2. Audit scope

Reviewed frontend, backend, routes, middleware, validation requests, controllers, services, models, migrations, environment examples, upload handling, CORS, PWA service worker, deployment files, dependency manifests, and tests.

## 3. Authentication mechanism

Admin login validates email/password with Laravel validation and `Hash::check`. Passwords are stored through Laravel's hashed cast. Login returns a Sanctum bearer token. Logout deletes the current access token. Password changes delete all admin tokens and require login again.

## 4. Authorization model

Admin endpoints are protected server-side by Sanctum and `admin.active`. Frontend route guards are only a convenience layer; backend routes enforce access. No public registration or public user role escalation path was found.

## 5. Security controls already present

- Laravel validation request classes for admin/product/category/order/settings inputs.
- Server-side order total calculation.
- Transactional stock updates with row locking during order creation.
- Admin route middleware.
- Rate limits on public catalog, loyalty lookup, order creation, admin login, and password changes.
- Environment-based CORS configuration.
- `.env` ignored by Git.
- Service worker excludes API, admin, checkout mutation requests, and non-GET requests from caching.

## 6. Confirmed vulnerabilities found

| Severity | Component | Evidence | Risk | Status |
| --- | --- | --- | --- | --- |
| Medium | Admin frontend token storage | `frontend/src/services/adminApi.js` stored admin bearer tokens in `localStorage` | Persistent tokens survive browser restarts and increase impact of XSS | Fixed |
| Medium | API security headers/cache | No Laravel API security headers middleware before this audit | API/admin responses could be cached or miss standard browser protections | Fixed |
| Medium | Public loyalty lookup privacy | `LoyaltyService::lookup` returned unused `customer_name` and `last_order_at` | Anyone with a phone number could infer extra personal data | Fixed |
| Medium | Token lifetime | Sanctum token expiration was `null` | Admin bearer tokens could remain valid indefinitely | Fixed |
| Low | Admin URL validation | Image/social URLs accepted generic `url` values without scheme/length limits | Risk of unsafe or unexpected URL schemes and oversized input | Fixed |
| Low | Input bounds | Some descriptions/search/settings values had no practical maximums | Abuse or oversized payload risk | Fixed |
| Low | Upload defense in depth | Upload request validation was present, but the storage service did not enforce an allowlist itself | Future service reuse could store unsupported file types | Fixed |
| Low | Frontend static headers | Static deployment headers were not defined for the SPA | Missing CSP/frame/permissions policies on some hosts | Fixed |

No confirmed critical or high severity issue was found in the reviewed source.

## 7. Fixes implemented

- Added API security headers middleware with `nosniff`, frame protection, CSP for API JSON responses, permissions policy, HSTS in production, and no-store API cache headers.
- Registered the middleware for Laravel API routes.
- Changed admin token persistence from `localStorage` to `sessionStorage`; legacy localStorage tokens are migrated for the current tab and removed.
- Set Sanctum token expiration from `SANCTUM_TOKEN_EXPIRATION`, defaulting to 720 minutes.
- Tightened product/category description, image URL, social URL, WhatsApp number, discount, delivery, and loyalty setting validation.
- Added bounded validation for public product search/category query parameters.
- Added an upload service extension allowlist for `jpg`, `jpeg`, `png`, and `webp`.
- Removed unused personal fields from public loyalty lookup responses.
- Added frontend deployment security headers in `frontend/vercel.json` and `frontend/public/_headers`.
- Added security regression tests for order tampering, quantity bounds, non-admin token rejection, unsafe uploads, API headers/CORS, loyalty privacy, and login rate limiting.
- Updated `backend/.env.example` with safe placeholders for token/session security settings.

## 8. Files modified

- `backend/app/Http/Middleware/SecurityHeaders.php`
- `backend/bootstrap/app.php`
- `backend/config/sanctum.php`
- `backend/.env.example`
- `backend/app/Http/Controllers/Api/Public/ProductController.php`
- `backend/app/Http/Requests/Admin/StoreProductRequest.php`
- `backend/app/Http/Requests/Admin/UpdateProductRequest.php`
- `backend/app/Http/Requests/Admin/StoreCategoryRequest.php`
- `backend/app/Http/Requests/Admin/UpdateCategoryRequest.php`
- `backend/app/Http/Requests/Admin/UpdateSettingsRequest.php`
- `backend/app/Http/Requests/Admin/UpdateSocialLinksRequest.php`
- `backend/app/Services/ImageUploadService.php`
- `backend/app/Services/LoyaltyService.php`
- `backend/tests/Feature/ApiSmokeTest.php`
- `frontend/src/services/adminApi.js`
- `frontend/vercel.json`
- `frontend/public/_headers`
- `SECURITY_AUDIT.md`
- `SECURITY.md`

## 9. Tests executed

- `php artisan test` - passed, 12 tests / 108 assertions.
- `npm.cmd run build` - passed.
- `npm.cmd audit --audit-level=moderate` - passed, 0 vulnerabilities.
- `composer audit --no-interaction` - passed, no advisories found.
- `php artisan route:list --except-vendor` - passed, 35 routes listed.
- `php artisan config:clear; php artisan route:cache; php artisan config:cache; php artisan view:cache; php artisan optimize:clear` - passed.
- `npm.cmd install` - passed, 0 vulnerabilities.
- `composer install --no-interaction --no-progress` - passed.
- PHP syntax checks on changed backend files - passed.
- JSON validation for `frontend/vercel.json` and `manifest.webmanifest` - passed.

## 10. Tests that could not run

- Frontend lint/typecheck/test commands were not run because this frontend package does not define those scripts.
- Real HTTPS/PWA install behavior must be verified after deployment on the production domain.
- Production database SSL, production object storage, CDN behavior, and real domain CORS must be verified in the hosting dashboards.

## 11. Required environment variables

- `APP_NAME`
- `APP_ENV`
- `APP_KEY`
- `APP_DEBUG`
- `APP_URL`
- `FRONTEND_URL`
- `CORS_ALLOWED_ORIGINS`
- `PORT`
- `DB_CONNECTION`
- `DB_URL`
- `DB_HOST`
- `DB_PORT`
- `DB_DATABASE`
- `DB_USERNAME`
- `DB_PASSWORD`
- `MYSQL_ATTR_SSL_CA`
- `SESSION_DRIVER`
- `SESSION_LIFETIME`
- `SESSION_ENCRYPT`
- `SESSION_DOMAIN`
- `SESSION_SECURE_COOKIE`
- `SESSION_HTTP_ONLY`
- `SESSION_SAME_SITE`
- `SANCTUM_STATEFUL_DOMAINS`
- `SANCTUM_TOKEN_PREFIX`
- `SANCTUM_TOKEN_EXPIRATION`
- `CACHE_STORE`
- `QUEUE_CONNECTION`
- `FILESYSTEM_DISK`
- `UPLOADS_DISK`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_DEFAULT_REGION`
- `AWS_BUCKET`
- `AWS_URL`
- `AWS_ENDPOINT`
- `AWS_USE_PATH_STYLE_ENDPOINT`
- `MAIL_MAILER`
- `MAIL_HOST`
- `MAIL_PORT`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`
- `MAIL_FROM_ADDRESS`
- `ADMIN_SEED_NAME`
- `ADMIN_SEED_EMAIL`
- `ADMIN_SEED_PASSWORD`
- `VITE_API_URL`
- `VITE_API_PROXY_TARGET`

## 12. Secrets that require manual rotation

No real production secret was found in tracked source during this audit. Test-only fixture values remain in `phpunit.xml` and backend tests. If any real `.env` value was ever shared, committed, or screenshotted outside this repository, rotate it manually in the relevant hosting dashboard.

## 13. Remaining risks

- Admin authentication still uses bearer tokens readable by browser JavaScript. This was hardened to session-only storage, but HttpOnly cookie auth would reduce XSS impact further and should be considered later if the deployment architecture allows it.
- Public loyalty lookup remains phone-number based by design. It now returns less personal data, but anyone who knows a phone number can still check points/order count.
- Rate limiting uses Laravel's configured cache backend. Multi-instance production deployments should use a shared cache such as Redis or database-backed cache.
- CSP allows `https:` for images and API connections to support external backend/storage domains. Tighten to exact domains after production URLs are final.
- Real production storage/database/HTTPS/CORS behavior cannot be fully verified until hosting credentials and domains are configured.

## 14. Deployment security checklist

- Set `APP_ENV=production` and `APP_DEBUG=false`.
- Generate a strong `APP_KEY` on the backend.
- Set `FRONTEND_URL` and `CORS_ALLOWED_ORIGINS` to exact HTTPS frontend origins.
- Set `VITE_API_URL` to the HTTPS backend origin.
- Set a strong `ADMIN_SEED_PASSWORD` only when intentionally seeding the first admin, then remove or rotate it.
- Use managed MySQL with SSL when provided by the host.
- Use persistent object storage for uploads in production.
- Use HTTPS only for frontend, backend, storage, and CDN URLs.
- Use a shared cache backend for rate limiting when running multiple backend instances.
- Verify PWA install and service worker updates on the production domain.

## 15. Recommended future improvements

- Move admin auth to HttpOnly secure cookies with CSRF protection if same-site or controlled cross-site deployment permits it.
- Add audit logging for admin product/order/settings changes.
- Add optional two-factor authentication for admin login.
- Add CAPTCHA or extra bot protection for high-abuse public endpoints if the site receives automated traffic.
- Restrict CSP `connect-src` and `img-src` to exact production domains after deployment.
