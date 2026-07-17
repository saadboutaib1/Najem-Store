-- MAGHRIB OUD Supabase schema for Vercel Serverless API
-- Run this file in the Supabase SQL Editor for a fresh production database.
-- Postgres syntax only. No MySQL/Laravel migrations are required in production.

create extension if not exists pgcrypto;

create table if not exists admins (
  id bigserial primary key,
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null default 'admin',
  status text not null default 'active' check (status in ('active', 'inactive')),
  remember_token text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists categories (
  id bigserial primary key,
  name_ar text not null,
  name_en text not null,
  name_fr text not null,
  slug text not null unique,
  description_ar text,
  description_en text,
  description_fr text,
  image text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists products (
  id bigserial primary key,
  category_id bigint not null references categories(id) on delete cascade,
  name_ar text not null,
  name_en text not null,
  name_fr text not null,
  slug text not null unique,
  description_ar text,
  description_en text,
  description_fr text,
  price numeric(10, 2) not null check (price >= 0),
  old_price numeric(10, 2) check (old_price is null or old_price >= 0),
  stock integer not null default 0 check (stock >= 0),
  main_image text,
  rating numeric(2, 1) not null default 5 check (rating >= 0 and rating <= 5),
  status text not null default 'active' check (status in ('active', 'inactive')),
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists product_images (
  id bigserial primary key,
  product_id bigint not null references products(id) on delete cascade,
  image text not null,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists orders (
  id bigserial primary key,
  order_number text not null unique,
  customer_name text not null,
  customer_phone text not null,
  city text not null,
  address text not null,
  notes text,
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  delivery_fee numeric(10, 2) not null default 0 check (delivery_fee >= 0),
  discount_total numeric(10, 2) not null default 0 check (discount_total >= 0),
  total numeric(10, 2) not null check (total >= 0),
  payment_method text not null default 'cash_on_delivery',
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled')),
  whatsapp_message text,
  loyalty_points_earned integer not null default 0 check (loyalty_points_earned >= 0),
  loyalty_points_awarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists order_items (
  id bigserial primary key,
  order_id bigint not null references orders(id) on delete cascade,
  product_id bigint references products(id) on delete set null,
  product_name_ar text not null,
  product_name_en text not null,
  product_name_fr text,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  total_price numeric(10, 2) not null check (total_price >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists settings (
  key text primary key,
  value text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists social_links (
  id bigserial primary key,
  platform text not null unique,
  url text not null default '',
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists customer_loyalty_points (
  id bigserial primary key,
  phone text not null unique,
  customer_name text,
  total_points integer not null default 0 check (total_points >= 0),
  total_orders integer not null default 0 check (total_orders >= 0),
  last_order_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_categories_status_sort on categories(status, sort_order);
create index if not exists idx_products_category_status on products(category_id, status);
create index if not exists idx_products_featured_status on products(is_featured, status);
create index if not exists idx_orders_status_created on orders(status, created_at desc);
create index if not exists idx_orders_phone on orders(customer_phone);
create index if not exists idx_order_items_order_id on order_items(order_id);
create index if not exists idx_loyalty_phone on customer_loyalty_points(phone);

alter table admins enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table settings enable row level security;
alter table social_links enable row level security;
alter table customer_loyalty_points enable row level security;

insert into categories (name_ar, name_en, name_fr, slug, description_ar, description_en, description_fr, image, status, sort_order)
values
  ('العود', 'Oud', 'Oud', 'oud', 'قطع عود مختارة بروائح عميقة تناسب المجالس والهدايا الفاخرة.', 'Selected oud pieces with deep aromas for gatherings and premium gifts.', 'Morceaux de oud sélectionnés aux arômes profonds, adaptés aux salons et aux cadeaux haut de gamme.', '/categories/oud.svg', 'active', 1),
  ('البخور', 'Bakhoor', 'Bakhoor', 'bakhoor', 'خلطات بخور شرقية تمنح البيت لمسة ضيافة دافئة وراقية.', 'Oriental bakhoor blends that bring a warm, elegant sense of hospitality to your home.', 'Mélanges de bakhoor orientaux qui apportent à la maison une ambiance chaleureuse, élégante et accueillante.', '/categories/bakhoor.svg', 'active', 2),
  ('العطور', 'Perfumes', 'Parfums', 'perfumes', 'عطور تجمع بين النفحات العربية والأناقة اليومية.', 'Perfumes that combine oriental notes with everyday elegance.', 'Parfums qui associent des notes orientales à une élégance adaptée au quotidien.', '/categories/perfumes.svg', 'active', 3)
on conflict (slug) do update set
  name_ar = excluded.name_ar,
  name_en = excluded.name_en,
  name_fr = excluded.name_fr,
  description_ar = excluded.description_ar,
  description_en = excluded.description_en,
  description_fr = excluded.description_fr,
  image = excluded.image,
  status = excluded.status,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into products (category_id, name_ar, name_en, name_fr, slug, description_ar, description_en, description_fr, price, old_price, stock, main_image, rating, status, is_featured)
values
  ((select id from categories where slug = 'oud'), 'عود ملكي فاخر', 'Premium Royal Oud', 'Oud royal premium', 'oud-royal', 'عود فاخر برائحة عميقة وثبات ممتاز، مناسب للمناسبات والهدايا الراقية.', 'Premium oud with a deep aroma and exceptional longevity, ideal for special occasions and elegant gifts.', 'Oud haut de gamme au parfum profond et à l’excellente tenue, idéal pour les occasions spéciales et les cadeaux élégants.', 420, 520, 8, '/products/oud-royal.svg', 4.9, 'active', true),
  ((select id from categories where slug = 'oud'), 'عود كمبودي مختار', 'Select Cambodian Oud', 'Oud cambodgien sélectionné', 'oud-cambodian', 'قطع عود كمبودي برائحة دافئة وغنية لمحبي الطابع الشرقي الأصيل.', 'Cambodian oud pieces with a warm, rich aroma for lovers of authentic oriental notes.', 'Morceaux de oud cambodgien au parfum chaud et riche, pensés pour les amateurs de notes orientales authentiques.', 360, null, 10, '/products/oud-cambodian.svg', 4.8, 'active', true),
  ((select id from categories where slug = 'oud'), 'عود هندي طبيعي', 'Natural Indian Oud', 'Oud indien naturel', 'oud-indian', 'عود هندي طبيعي يناسب الاستخدام اليومي ويمنح المكان رائحة زكية وثابتة.', 'Natural Indian oud for everyday use, bringing a long-lasting, elegant fragrance to your space.', 'Oud indien naturel adapté à l’usage quotidien, apportant une fragrance élégante et durable à votre espace.', 290, null, 12, '/products/oud-indian.svg', 4.7, 'active', false),
  ((select id from categories where slug = 'bakhoor'), 'بخور سلطاني', 'Sultani Bakhoor', 'Bakhoor sultani', 'bakhoor-sultani', 'بخور شرقي فاخر بلمسة عنبرية مثالية للضيافة والمجالس.', 'Luxurious oriental bakhoor with amber notes, perfect for welcoming guests and elevating gatherings.', 'Bakhoor oriental luxueux aux notes ambrées, parfait pour accueillir les invités et sublimer les réunions.', 180, 220, 15, '/products/bakhoor-sultani.svg', 4.8, 'active', true),
  ((select id from categories where slug = 'bakhoor'), 'بخور العنبر', 'Amber Bakhoor', 'Bakhoor à l’ambre', 'bakhoor-amber', 'خلطة بخور دافئة تجمع بين العنبر واللمسات الخشبية الناعمة.', 'A warm bakhoor blend combining amber with soft woody notes.', 'Mélange de bakhoor chaleureux associant l’ambre à de douces notes boisées.', 140, null, 18, '/products/bakhoor-amber.svg', 4.6, 'active', false),
  ((select id from categories where slug = 'bakhoor'), 'بخور المسك الشرقي', 'Oriental Musk Bakhoor', 'Bakhoor musc oriental', 'bakhoor-musk', 'بخور ناعم بنفحات المسك، مناسب للأجواء الهادئة والاستخدام اليومي.', 'Soft bakhoor with musk notes, suitable for calm atmospheres and everyday use.', 'Bakhoor doux aux notes musquées, adapté aux ambiances calmes et à l’usage quotidien.', 125, null, 20, '/products/bakhoor-musk.svg', 4.5, 'active', false),
  ((select id from categories where slug = 'perfumes'), 'عطر النجم الذهبي', 'Golden Star Perfume', 'Parfum étoile dorée', 'perfume-gold-star', 'عطر فاخر بتوازن بين النفحات الشرقية والانتعاش العصري.', 'A luxurious perfume that balances oriental notes with modern freshness.', 'Parfum luxueux qui équilibre les notes orientales avec une fraîcheur moderne.', 230, 280, 9, '/products/perfume-gold-star.svg', 4.9, 'active', true),
  ((select id from categories where slug = 'perfumes'), 'عطر الورد الشرقي', 'Oriental Rose Perfume', 'Parfum rose orientale', 'perfume-oriental-rose', 'عطر ورد شرقي أنيق بلمسة دافئة تدوم طوال اليوم.', 'An elegant oriental rose perfume with a warm trail that lasts all day.', 'Parfum élégant à la rose orientale, avec un sillage chaleureux qui dure toute la journée.', 210, null, 11, '/products/perfume-oriental-rose.svg', 4.7, 'active', false),
  ((select id from categories where slug = 'perfumes'), 'عطر المسك الأبيض', 'White Musk Perfume', 'Parfum musc blanc', 'perfume-white-musk', 'مسك أبيض ناعم ونقي، مناسب للاستخدام اليومي ولجميع الأذواق.', 'Soft, clean white musk suitable for everyday wear and a wide range of tastes.', 'Musc blanc doux et propre, adapté au quotidien et à une large variété de goûts.', 190, null, 14, '/products/perfume-white-musk.svg', 4.6, 'active', false)
on conflict (slug) do update set
  category_id = excluded.category_id,
  name_ar = excluded.name_ar,
  name_en = excluded.name_en,
  name_fr = excluded.name_fr,
  description_ar = excluded.description_ar,
  description_en = excluded.description_en,
  description_fr = excluded.description_fr,
  price = excluded.price,
  old_price = excluded.old_price,
  stock = excluded.stock,
  main_image = excluded.main_image,
  rating = excluded.rating,
  status = excluded.status,
  is_featured = excluded.is_featured,
  updated_at = now();

insert into settings (key, value)
values
  ('store_name', 'MAGHRIB OUD'),
  ('whatsapp_number', '+212601892738'),
  ('currency', 'MAD'),
  ('delivery_fee', '30'),
  ('default_language', 'ar'),
  ('payment_method', 'cash_on_delivery'),
  ('country', 'Morocco'),
  ('buy2_offer_enabled', 'false'),
  ('buy2_offer_starts_at', ''),
  ('buy2_offer_ends_at', ''),
  ('buy2_discount_type', 'percentage'),
  ('buy2_discount_value', '10'),
  ('loyalty_points_enabled', 'true'),
  ('loyalty_amount_per_point', '10'),
  ('loyalty_reward_points', '100'),
  ('loyalty_reward_value', '20')
on conflict (key) do update set value = excluded.value, updated_at = now();

insert into social_links (platform, url, status)
values
  ('whatsapp', 'https://wa.me/212601892738', 'active'),
  ('facebook', 'https://facebook.com/maghriboud', 'active'),
  ('instagram', 'https://instagram.com/maghriboud', 'active'),
  ('tiktok', 'https://tiktok.com/@maghriboud', 'active'),
  ('youtube', 'https://youtube.com/@maghriboud', 'active')
on conflict (platform) do update set url = excluded.url, status = excluded.status, updated_at = now();

-- Initial admin setup, safe method:
-- Keep the admins table empty, then set ADMIN_EMAIL and ADMIN_PASSWORD in Vercel.
-- On the first successful login, the serverless API creates a bcrypt-hashed admin automatically.
-- If you prefer SQL seeding, generate a bcrypt hash locally and insert it manually:
-- insert into admins (name, email, password_hash, role, status)
-- values ('MAGHRIB OUD Admin', 'admin@example.com', '<BCRYPT_HASH_HERE>', 'admin', 'active')
-- on conflict (email) do nothing;