# Database Schema - Najem Store

## 1. Schema Principles

The database should support Arabic-first product content, English translations, admin management, Cash on Delivery orders, and WhatsApp checkout history.

Recommended relational database: PostgreSQL or MySQL.

## 2. Tables Overview

- `admins`
- `categories`
- `products`
- `product_images`
- `customers`
- `orders`
- `order_items`
- `delivery_zones`
- `store_settings`
- `social_links`
- `whatsapp_messages`

## 3. admins

Stores users who can access the admin panel.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid / bigint | Primary key |
| `name` | varchar | Admin display name |
| `email` | varchar | Unique |
| `password_hash` | varchar | Hashed password |
| `role` | varchar | `owner`, `manager`, `staff` |
| `is_active` | boolean | Enables/disables account |
| `created_at` | timestamp | Creation date |
| `updated_at` | timestamp | Last update |

## 4. categories

Stores the four core categories and future additions.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid / bigint | Primary key |
| `name_ar` | varchar | Arabic name |
| `name_en` | varchar | English name |
| `slug` | varchar | Unique URL slug |
| `description_ar` | text | Arabic description |
| `description_en` | text | English description |
| `image_url` | varchar | Optional category image |
| `sort_order` | integer | Display order |
| `is_active` | boolean | Public visibility |
| `created_at` | timestamp | Creation date |
| `updated_at` | timestamp | Last update |

Initial categories:

- العود / Oud
- البخور / Bakhoor
- العطور / Perfumes
- المسواك / Miswak

## 5. products

Stores product catalog data.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid / bigint | Primary key |
| `category_id` | uuid / bigint | Foreign key to `categories.id` |
| `name_ar` | varchar | Arabic product name |
| `name_en` | varchar | English product name |
| `slug` | varchar | Unique URL slug |
| `description_ar` | text | Arabic description |
| `description_en` | text | English description |
| `price` | decimal | Current selling price |
| `compare_at_price` | decimal | Optional old price |
| `sku` | varchar | Optional internal reference |
| `stock_quantity` | integer | Available stock |
| `weight` | decimal | Optional delivery calculation field |
| `is_featured` | boolean | Homepage visibility |
| `is_active` | boolean | Public visibility |
| `created_at` | timestamp | Creation date |
| `updated_at` | timestamp | Last update |

## 6. product_images

Stores one or more product images.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid / bigint | Primary key |
| `product_id` | uuid / bigint | Foreign key to `products.id` |
| `image_url` | varchar | Image location |
| `alt_ar` | varchar | Arabic alt text |
| `alt_en` | varchar | English alt text |
| `sort_order` | integer | Gallery order |
| `is_primary` | boolean | Main product image |
| `created_at` | timestamp | Creation date |

## 7. customers

Stores customer data when the backend captures orders.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid / bigint | Primary key |
| `name` | varchar | Customer full name |
| `phone` | varchar | Customer phone number |
| `city` | varchar | Customer city |
| `address` | text | Delivery address |
| `created_at` | timestamp | Creation date |
| `updated_at` | timestamp | Last update |

## 8. orders

Stores order records. Even if WhatsApp is the main confirmation channel, backend order capture is useful for admin tracking.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid / bigint | Primary key |
| `order_number` | varchar | Human-readable unique number |
| `customer_id` | uuid / bigint | Foreign key to `customers.id` |
| `status` | varchar | `pending`, `confirmed`, `preparing`, `shipped`, `delivered`, `cancelled` |
| `payment_method` | varchar | Always `cash_on_delivery` for V1 |
| `subtotal` | decimal | Sum of order item totals |
| `delivery_fee` | decimal | Nullable when unavailable |
| `total` | decimal | Subtotal plus delivery fee |
| `currency` | varchar | Example: `MAD` |
| `whatsapp_url` | text | Generated WhatsApp link if saved |
| `notes` | text | Optional admin/customer note |
| `created_at` | timestamp | Creation date |
| `updated_at` | timestamp | Last update |

## 9. order_items

Stores product snapshots for each order.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid / bigint | Primary key |
| `order_id` | uuid / bigint | Foreign key to `orders.id` |
| `product_id` | uuid / bigint | Foreign key to `products.id`, nullable if product deleted |
| `product_name_ar` | varchar | Snapshot |
| `product_name_en` | varchar | Snapshot |
| `quantity` | integer | Ordered quantity |
| `unit_price` | decimal | Price at checkout |
| `line_total` | decimal | Quantity multiplied by unit price |
| `created_at` | timestamp | Creation date |

## 10. delivery_zones

Stores delivery pricing by city or region.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid / bigint | Primary key |
| `city_ar` | varchar | Arabic city name |
| `city_en` | varchar | English city name |
| `delivery_fee` | decimal | Delivery amount |
| `is_active` | boolean | Availability |
| `created_at` | timestamp | Creation date |
| `updated_at` | timestamp | Last update |

## 11. store_settings

Stores editable business configuration.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid / bigint | Primary key |
| `key` | varchar | Unique setting key |
| `value` | text/json | Setting value |
| `created_at` | timestamp | Creation date |
| `updated_at` | timestamp | Last update |

Suggested keys:

- `store_name`
- `default_language`
- `default_currency`
- `whatsapp_business_number`
- `support_phone`
- `support_email`
- `delivery_fee_default`

## 12. social_links

Stores public social media links.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid / bigint | Primary key |
| `platform` | varchar | `whatsapp`, `facebook`, `instagram`, `tiktok`, `youtube` |
| `url` | varchar | Public URL |
| `is_active` | boolean | Public visibility |
| `sort_order` | integer | Display order |
| `created_at` | timestamp | Creation date |
| `updated_at` | timestamp | Last update |

## 13. whatsapp_messages

Stores generated WhatsApp checkout messages when useful for audit/debugging.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid / bigint | Primary key |
| `order_id` | uuid / bigint | Nullable foreign key to `orders.id` |
| `customer_phone` | varchar | Customer phone snapshot |
| `message_body` | text | Human-readable generated message |
| `encoded_url` | text | Final WhatsApp URL |
| `created_at` | timestamp | Creation date |

## 14. Relationships

- One category has many products.
- One product has many product images.
- One customer has many orders.
- One order has many order items.
- One product can appear in many order items.
- One order can have one generated WhatsApp message.

## 15. Indexes

Recommended indexes:

- `categories.slug`
- `products.slug`
- `products.category_id`
- `products.is_active`
- `orders.order_number`
- `orders.status`
- `orders.created_at`
- `customers.phone`
- `delivery_zones.city_ar`
- `delivery_zones.city_en`
