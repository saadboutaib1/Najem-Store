# API Routes - Najem Store

## 1. API Principles

- Prefix all routes with `/api`.
- Use JSON request and response bodies.
- Keep public catalog routes separate from admin routes.
- Protect admin routes with authentication.
- Validate all input.
- Return localized content fields, or return both Arabic and English values so the frontend can choose.

## 2. Public Routes

### Store Settings

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/store/settings` | Get public store settings |
| `GET` | `/api/store/social-links` | Get active social media links |

### Categories

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/categories` | List active categories |
| `GET` | `/api/categories/:slug` | Get category details |
| `GET` | `/api/categories/:slug/products` | List products in a category |

### Products

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/products` | List active products with filters |
| `GET` | `/api/products/featured` | List featured products |
| `GET` | `/api/products/:slug` | Get product details |

Suggested query parameters for `/api/products`:

- `category`
- `search`
- `minPrice`
- `maxPrice`
- `sort`
- `page`
- `limit`

### Delivery

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/delivery-zones` | List active delivery zones |
| `GET` | `/api/delivery-fee?city={city}` | Get delivery fee for a city |

### Checkout

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/checkout/quote` | Validate cart and calculate subtotal, delivery fee, and total |
| `POST` | `/api/checkout/orders` | Optional: create pending order before WhatsApp redirect |
| `POST` | `/api/checkout/whatsapp-message` | Optional: generate WhatsApp message server-side |

The frontend can generate the WhatsApp message locally for V1. Server-side generation is useful later when the store wants permanent order tracking and stronger price validation.

## 3. Admin Auth Routes

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/admin/auth/login` | Admin login |
| `POST` | `/api/admin/auth/logout` | Admin logout |
| `GET` | `/api/admin/auth/me` | Current admin profile |

## 4. Admin Category Routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/admin/categories` | List all categories |
| `POST` | `/api/admin/categories` | Create category |
| `GET` | `/api/admin/categories/:id` | Get category by ID |
| `PATCH` | `/api/admin/categories/:id` | Update category |
| `DELETE` | `/api/admin/categories/:id` | Soft delete/deactivate category |

## 5. Admin Product Routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/admin/products` | List all products |
| `POST` | `/api/admin/products` | Create product |
| `GET` | `/api/admin/products/:id` | Get product by ID |
| `PATCH` | `/api/admin/products/:id` | Update product |
| `DELETE` | `/api/admin/products/:id` | Soft delete/deactivate product |
| `POST` | `/api/admin/products/:id/images` | Add product image |
| `PATCH` | `/api/admin/products/:id/images/:imageId` | Update product image |
| `DELETE` | `/api/admin/products/:id/images/:imageId` | Delete product image |

## 6. Admin Order Routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/admin/orders` | List orders |
| `GET` | `/api/admin/orders/:id` | Get order details |
| `PATCH` | `/api/admin/orders/:id/status` | Update order status |
| `PATCH` | `/api/admin/orders/:id/notes` | Update internal notes |

Suggested query parameters for `/api/admin/orders`:

- `status`
- `phone`
- `city`
- `from`
- `to`
- `page`
- `limit`

## 7. Admin Delivery Routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/admin/delivery-zones` | List all delivery zones |
| `POST` | `/api/admin/delivery-zones` | Create delivery zone |
| `PATCH` | `/api/admin/delivery-zones/:id` | Update delivery zone |
| `DELETE` | `/api/admin/delivery-zones/:id` | Deactivate delivery zone |

## 8. Admin Settings Routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/admin/settings` | List settings |
| `PATCH` | `/api/admin/settings` | Update settings |
| `GET` | `/api/admin/social-links` | List social links |
| `POST` | `/api/admin/social-links` | Create social link |
| `PATCH` | `/api/admin/social-links/:id` | Update social link |
| `DELETE` | `/api/admin/social-links/:id` | Deactivate social link |

## 9. Example Checkout Quote Request

```json
{
  "city": "Casablanca",
  "items": [
    {
      "productId": "product-id",
      "quantity": 2
    }
  ]
}
```

## 10. Example Checkout Quote Response

```json
{
  "currency": "MAD",
  "subtotal": 500,
  "deliveryFee": 30,
  "total": 530,
  "items": [
    {
      "productId": "product-id",
      "nameAr": "عود فاخر",
      "nameEn": "Premium Oud",
      "quantity": 2,
      "unitPrice": 250,
      "lineTotal": 500
    }
  ]
}
```

## 11. Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "fields": {
      "phone": "Phone number is required"
    }
  }
}
```
