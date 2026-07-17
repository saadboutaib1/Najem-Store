# Vercel API Route Audit

Production API architecture for MAGHRIB OUD is Vercel Serverless Functions under `frontend/api` with Supabase Postgres accessed only from server-side API code.

`frontend/vercel.json` keeps `/api/*` out of the React Router fallback. Non-API routes are rewritten to `/index.html` only.

## Deployment Note

Vercel Hobby allows no more than 12 Serverless Functions per deployment. The API is intentionally compact: most endpoints are served by catch-all handlers, while only the routes that need explicit Vercel matching remain as separate files. Do not add one file per endpoint unless the function count remains under the Hobby limit.

## Active Function Files

| Function file | Handles | Status |
| --- | --- | --- |
| `frontend/api/[...path].js` | Public catch-all and shared admin implementation | Implemented |
| `frontend/api/admin/[...path].js` | Admin nested catch-all for CRUD routes | Implemented |
| `frontend/api/admin/login.js` | Environment-based admin login | Implemented |
| `frontend/api/admin/profile.js` | Admin profile read/update | Implemented |
| `frontend/api/admin/dashboard.js` | Admin dashboard metrics | Implemented |
| `frontend/api/products/[id].js` | Public product details by id or slug | Implemented |
| `frontend/api/products/featured.js` | Public featured products | Implemented |

Current deployable serverless function count: 7, which is below the Vercel Hobby limit.

## Route Inventory

| Endpoint | Function file | Method | Auth required | Status |
| --- | --- | --- | --- | --- |
| `/api/categories` | `frontend/api/[...path].js` | GET | No | Implemented |
| `/api/products` | `frontend/api/[...path].js` | GET | No | Implemented |
| `/api/products/featured` | `frontend/api/products/featured.js` | GET | No | Implemented |
| `/api/products/:idOrSlug` | `frontend/api/products/[id].js` | GET | No | Implemented |
| `/api/settings` | `frontend/api/[...path].js` | GET | No | Implemented |
| `/api/social-links` | `frontend/api/[...path].js` | GET | No | Implemented |
| `/api/loyalty-points?phone=...` | `frontend/api/[...path].js` | GET | No | Implemented |
| `/api/orders` | `frontend/api/[...path].js` | POST | No | Implemented |
| `/api/admin/login` | `frontend/api/admin/login.js` | POST | No | Implemented |
| `/api/admin/logout` | `frontend/api/admin/[...path].js` | POST | Yes | Implemented |
| `/api/admin/profile` | `frontend/api/admin/profile.js` | GET, PUT | Yes | Implemented |
| `/api/admin/change-password` | `frontend/api/admin/[...path].js` | PUT | Yes | Implemented |
| `/api/admin/dashboard` | `frontend/api/admin/dashboard.js` | GET | Yes | Implemented |
| `/api/admin/categories` | `frontend/api/admin/[...path].js` | GET, POST | Yes | Implemented |
| `/api/admin/categories/:id` | `frontend/api/admin/[...path].js` | GET, PUT, DELETE | Yes | Implemented |
| `/api/admin/products` | `frontend/api/admin/[...path].js` | GET, POST | Yes | Implemented |
| `/api/admin/products/:id` | `frontend/api/admin/[...path].js` | GET, PUT, DELETE | Yes | Implemented |
| `/api/admin/orders` | `frontend/api/admin/[...path].js` | GET | Yes | Implemented |
| `/api/admin/orders/:id` | `frontend/api/admin/[...path].js` | GET, DELETE | Yes | Implemented |
| `/api/admin/orders/:id/status` | `frontend/api/admin/[...path].js` | PUT | Yes | Implemented |
| `/api/admin/settings` | `frontend/api/admin/[...path].js` | GET, PUT | Yes | Implemented |
| `/api/admin/social-links` | `frontend/api/admin/[...path].js` | GET, PUT | Yes | Implemented |

## Shared Helpers

| Helper | Purpose | Status |
| --- | --- | --- |
| `frontend/api/_lib/supabase.js` | Supabase service-role client, formatting, settings, auth token helpers, request parsing, JSON responses | Implemented |
| `frontend/api/_lib/auth.js` | Re-exports admin token creation and validation helpers for serverless routes | Implemented |
| `frontend/api/_lib/response.js` | Re-exports Laravel-compatible JSON response helpers | Implemented |

## Notes

- `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_TOKEN_SECRET` are used only inside Vercel API functions.
- Browser code calls the same-origin `/api` base through `VITE_API_URL=/api`.
- Admin requests send `Authorization: Bearer <token>` using the `admin_token` browser storage key.
- Product responses include both snake_case and camelCase compatibility fields such as `old_price`/`oldPrice` and `is_featured`/`isFeatured`.
- Public featured products return an empty array when no featured products exist.
