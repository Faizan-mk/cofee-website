-- ============================================================
-- Bean Scene backend schema
-- Run in Supabase: SQL Editor -> New query -> paste -> Run
-- ============================================================

-- 1) Newsletter subscribers (public form, no auth required)
create table if not exists public.newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  created_at timestamptz default now()
);

-- 2) Contact messages (public form, no auth required)
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  subject    text,
  message    text not null,
  created_at timestamptz default now()
);

-- 3) Menu items (read-only for everyone, managed from the dashboard)
create table if not exists public.menu_items (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  description  text,
  price        numeric(10,2) not null,
  category     text not null check (category in ('Hot Coffee', 'Cold Coffee', 'Desserts')),
  image_url    text,
  badge        text,
  is_available boolean default true,
  created_at   timestamptz default now()
);

-- 4) Orders (guest checkout, no auth required)
create table if not exists public.orders (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users on delete set null,
  customer_name  text not null,
  email          text not null,
  phone          text not null,
  address        text not null,
  payment_method text not null check (payment_method in ('cash', 'card')),
  subtotal       numeric(10,2) not null,
  tax            numeric(10,2) not null,
  delivery_fee   numeric(10,2) not null,
  total          numeric(10,2) not null,
  status         text default 'pending' check (status in ('pending', 'confirmed', 'preparing', 'delivered', 'cancelled')),
  created_at     timestamptz default now()
);

-- 5) Individual line items per order
create table if not exists public.order_items (
  id        uuid primary key default gen_random_uuid(),
  order_id  uuid not null references public.orders on delete cascade,
  item_name text not null,
  quantity  int  not null check (quantity > 0),
  price     numeric(10,2) not null
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.newsletter_subscribers enable row level security;
alter table public.contact_messages      enable row level security;
alter table public.menu_items            enable row level security;
alter table public.orders                enable row level security;
alter table public.order_items           enable row level security;

-- Newsletter: anyone can subscribe (no read policy = nobody can read via the client)
create policy "Anyone can subscribe"
  on public.newsletter_subscribers for insert
  with check (true);

-- Contact messages: anyone can submit; only authenticated users can read
create policy "Anyone can send a message"
  on public.contact_messages for insert
  with check (true);

create policy "Authenticated users can read messages"
  on public.contact_messages for select
  using (auth.role() = 'authenticated');

-- Menu items: public read only
create policy "Anyone can view menu"
  on public.menu_items for select
  using (true);

-- Orders: anyone can place an order; the customer can view their own
create policy "Anyone can place an order"
  on public.orders for insert
  with check (true);

create policy "Customer can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

-- Order items: inserted alongside the order
create policy "Anyone can add order items"
  on public.order_items for insert
  with check (true);

create policy "Customer can view own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );
