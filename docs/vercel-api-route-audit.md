# Vercel API Route Audit

Production API architecture for MAGHRIB OUD is Vercel Serverless Functions under `frontend/api` with Supabase Postgres accessed only from server-side code in `frontend/server`.

`frontend/vercel.json` keeps `/api/*` out of the React Router fallback. Non-API routes are rewritten to `/index.html` only.

## Deployment Note

Vercel Hobby allows no more than 12 Serverless Functions per deployment. The API is intentionally compact and uses Vercel-compatible dynamic segment routes instead of catch-all route files. This keeps the function count below the Hobby limit while still serving every public and admin endpoint.

Do not add one file per endpoint unless the deployable function count remains under 12. Shared helpers must stay outside `frontend/api` so Vercel does not treat them as functions.

## Active Function Files

| Function file | Handles | Status |
| --- | --- | --- |
| `frontend/api/[resource].js` | Public one-segment routes such as categories, settings, social links, loyalty points, and order creation | Implemented |
| `frontend/api/products/index.js` | Public products list | Implemented |
| `frontend/api/products/featured.js` | Public featured products | Implemented |
| `frontend/api/products/[id].js` | Public product details by id or slug | Implemented |
| `frontend/api/admin/[resource].js` | Admin one-segment routes such as products, categories, orders, settings, social links, logout, and change password | Implemented |
| `frontend/api/admin/[resource]/[id].js` | Admin item routes for products, categories, and orders | Implemented |
| `frontend/api/admin/[resource]/[id]/[action].js` | Admin item action routes such as order status updates | Implemented |
| `frontend/api/admin/login.js` | Environment-based admin login | Implemented |
| `frontend/api/admin/profile.js` | Admin profile read/update | Implemented |
| `frontend/api/admin/dashboard.js` | Admin dashboard metrics | Implemented |

Current deployable serverless function count: 10, which is below the Vercel Hobby limit.

## Route Inventory

| Endpoint | Function file | Method | Auth required | Status |
| --- | --- | --- | --- | --- |
| `/api/categories` | `frontend/api/[resource].js` | GET | No | Implemented |
| `/api/products` | `frontend/api/products/index.js` | GET | No | Implemented |
| `/api/products/featured` | `frontend/api/products/featured.js` | GET | No | Implemented |
| `/api/products/:idOrSlug` | `frontend/api/products/[id].js` | GET | No | Implemented |
| `/api/settings` | `frontend/api/[resource].js` | GET | No | Implemented |
| `/api/social-links` | `frontend/api/[resource].js` | GET | No | Implemented |
| `/api/loyalty-points?phone=...` | `frontend/api/[resource].js` | GET | No | Implemented |
| `/api/orders` | `frontend/api/[resource].js` | POST | No | Implemented |
| `/api/admin/login` | `frontend/api/admin/login.js` | POST | No | Implemented |
| `/api/admin/logout` | `frontend/api/admin/[resource].js` | POST | Yes | Implemented |
| `/api/admin/profile` | `frontend/api/admin/profile.js` | GET, PUT | Yes | Implemented |
| `/api/admin/change-password` | `frontend/api/admin/[resource].js` | PUT | Yes | Implemented |
| `/api/admin/dashboard` | `frontend/api/admin/dashboard.js` | GET | Yes | Implemented |
| `/api/admin/categories` | `frontend/api/admin/[resource].js` | GET, POST | Yes | Implemented |
| `/api/admin/categories/:id` | `frontend/api/admin/[resource]/[id].js` | GET, PUT, DELETE | Yes | Implemented |
| `/api/admin/products` | `frontend/api/admin/[resource].js` | GET, POST | Yes | Implemented |
| `/api/admin/products/:id` | `frontend/api/admin/[resource]/[id].js` | GET, PUT, DELETE | Yes | Implemented |
| `/api/admin/orders` | `frontend/api/admin/[resource].js` | GET | Yes | Implemented |
| `/api/admin/orders/:id` | `frontend/api/admin/[resource]/[id].js` | GET, DELETE | Yes | Implemented |
| `/api/admin/orders/:id/status` | `frontend/api/admin/[resource]/[id]/[action].js` | PUT | Yes | Implemented |
| `/api/admin/settings` | `frontend/api/admin/[resource].js` | GET, PUT | Yes | Implemented |
| `/api/admin/social-links` | `frontend/api/admin/[resource].js` | GET, PUT | Yes | Implemented |

## Shared Server Helpers

| Helper | Purpose | Status |
| --- | --- | --- |
| `frontend/server/supabase.js` | Supabase service-role client, formatting, settings, auth token helpers, request parsing, JSON responses | Implemented |
| `frontend/server/router.js` | Shared route implementation used by compact Vercel route files | Implemented |
| `frontend/server/auth.js` | Re-exports admin token creation and validation helpers for serverless routes | Implemented |
| `frontend/server/response.js` | Re-exports Laravel-compatible JSON response helpers | Implemented |

## Notes

- `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_TOKEN_SECRET` are used only inside Vercel API functions and server helpers.
- Browser code calls the same-origin `/api` base through `VITE_API_URL=/api`.
- Admin requests send `Authorization: Bearer <token>` using the `admin_token` browser storage key.
- Product responses include both snake_case and camelCase compatibility fields such as `old_price`/`oldPrice` and `is_featured`/`isFeatured`.
- Public featured products return an empty array when no featured products exist.
