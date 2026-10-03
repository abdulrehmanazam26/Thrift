-- Run once against the private Postgres database before enabling custom checkout.
-- All commerce tables live outside Supabase's exposed public schema.
create schema if not exists store_private;
revoke all on schema store_private from public, anon, authenticated;

create table if not exists store_private.products (
  id uuid primary key default gen_random_uuid(),
  handle text not null unique check (handle ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  brand text not null default 'Unbranded',
  description text not null default '',
  category text not null default 'Clothing',
  gender text not null default 'Unisex',
  style text[] not null default '{}',
  condition text not null default 'Good' check (condition in ('Premium', 'Like new', 'Excellent', 'Very good', 'Good')),
  condition_notes text not null default '',
  size_label text not null default 'One size',
  measurements jsonb not null default '{}'::jsonb,
  color text not null default 'Not specified',
  material text,
  price integer not null check (price >= 0),
  compare_at_price integer check (compare_at_price is null or compare_at_price >= price),
  stock integer not null default 1 check (stock >= 0),
  images jsonb not null default '[]'::jsonb,
  defects text[] not null default '{}',
  tags text[] not null default '{}',
  collections text[] not null default '{}',
  era text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists store_private.product_images (
  id uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type in ('image/jpeg', 'image/png', 'image/webp')),
  data bytea not null,
  created_at timestamptz not null default now()
);

create table if not exists store_private.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated always as identity (start with 1001) unique,
  idempotency_key uuid not null unique,
  access_token_hash text not null,
  customer_name text not null,
  phone text not null,
  email text,
  address_line1 text not null,
  address_line2 text,
  area text not null,
  city text not null default 'Karachi' check (lower(city) = 'karachi'),
  customer_note text,
  subtotal integer not null check (subtotal >= 0),
  delivery_fee integer not null check (delivery_fee >= 0),
  total integer not null check (total = subtotal + delivery_fee),
  payment_method text not null default 'cod' check (payment_method = 'cod'),
  status text not null default 'new' check (status in ('new', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists store_private.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references store_private.orders(id) on delete cascade,
  product_id uuid not null references store_private.products(id),
  product_title text not null,
  unit_price integer not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total integer not null check (line_total = unit_price * quantity),
  unique (order_id, product_id)
);

create table if not exists store_private.store_settings (
  singleton boolean primary key default true check (singleton),
  delivery_city text not null default 'Karachi',
  delivery_fee integer not null default 250 check (delivery_fee >= 0),
  checkout_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);
insert into store_private.store_settings (singleton, delivery_city, delivery_fee, checkout_enabled)
values (true, 'Karachi', 250, false)
on conflict (singleton) do nothing;

create table if not exists store_private.admin_login_attempts (
  ip_hash text primary key,
  attempts integer not null default 0,
  blocked_until timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists store_private.checkout_attempts (
  ip_hash text primary key,
  attempts integer not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists products_live_idx on store_private.products (is_active, created_at desc);
create index if not exists orders_recent_idx on store_private.orders (created_at desc);
create index if not exists orders_status_idx on store_private.orders (status, created_at desc);
create index if not exists order_items_order_idx on store_private.order_items (order_id);

alter table store_private.products enable row level security;
alter table store_private.product_images enable row level security;
alter table store_private.orders enable row level security;
alter table store_private.order_items enable row level security;
alter table store_private.store_settings enable row level security;
alter table store_private.admin_login_attempts enable row level security;
alter table store_private.checkout_attempts enable row level security;
