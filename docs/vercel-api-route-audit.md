# Vercel API Route Audit

Production API architecture for MAGHRIB OUD is Vercel Serverless Functions under `frontend/api` with Supabase Postgres accessed only from server-side API code.

`frontend/vercel.json` keeps `/api/*` out of the React Router fallback. Non-API routes are rewritten to `/index.html` only.

## Route Inventory

| Endpoint | File | Method | Auth required | Status |
| --- | --- | --- | --- | --- |
| `/api/categories` | `frontend/api/categories.js` | GET | No | Implemented |
| `/api/products` | `frontend/api/products/index.js` | GET | No | Implemented |
| `/api/products/featured` | `frontend/api/products/featured.js` | GET | No | Implemented |
| `/api/products/:idOrSlug` | `frontend/api/products/[id].js` | GET | No | Implemented |
| `/api/settings` | `frontend/api/settings.js` | GET | No | Implemented |
| `/api/social-links` | `frontend/api/social-links.js` | GET | No | Implemented |
| `/api/loyalty-points?phone=...` | `frontend/api/loyalty-points.js` | GET | No | Implemented |
| `/api/orders` | `frontend/api/orders.js` | POST | No | Implemented |
| `/api/admin/login` | `frontend/api/admin/login.js` | POST | No | Implemented |
| `/api/admin/logout` | `frontend/api/admin/logout.js` | POST | Yes | Implemented |
| `/api/admin/profile` | `frontend/api/admin/profile.js` | GET, PUT | Yes | Implemented |
| `/api/admin/change-password` | `frontend/api/admin/change-password.js` | PUT | Yes | Implemented |
| `/api/admin/dashboard` | `frontend/api/admin/dashboard.js` | GET | Yes | Implemented |
| `/api/admin/categories` | `frontend/api/admin/categories/index.js` | GET, POST | Yes | Implemented |
| `/api/admin/categories/:id` | `frontend/api/admin/categories/[id].js` | GET, PUT, DELETE | Yes | Implemented |
| `/api/admin/products` | `frontend/api/admin/products/index.js` | GET, POST | Yes | Implemented |
| `/api/admin/products/:id` | `frontend/api/admin/products/[id].js` | GET, PUT, DELETE | Yes | Implemented |
| `/api/admin/orders` | `frontend/api/admin/orders/index.js` | GET | Yes | Implemented |
| `/api/admin/orders/:id` | `frontend/api/admin/orders/[id].js` | GET, DELETE | Yes | Implemented |
| `/api/admin/orders/:id/status` | `frontend/api/admin/orders/[id]/status.js` | PUT | Yes | Implemented |
| `/api/admin/settings` | `frontend/api/admin/settings.js` | GET, PUT | Yes | Implemented |
| `/api/admin/social-links` | `frontend/api/admin/social-links.js` | GET, PUT | Yes | Implemented |

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