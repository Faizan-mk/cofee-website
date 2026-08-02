# Bean Scene — All Database Tables

This is the **complete reference of every table** you must create in Supabase for the Bean Scene frontend to work.

There are **5 tables** (plus 1 optional) that the app uses:

| # | Table | Used by | Creates data via |
| --- | --- | --- | --- |
| 1 | `newsletter_subscribers` | Home → Newsletter section | `INSERT` (public) |
| 2 | `contact_messages` | `/contact` form | `INSERT` (public) |
| 3 | `menu_items` | `/menu`, Home (optional seed) | `SELECT` (public) |
| 4 | `orders` | `/order` checkout | `INSERT` (public) |
| 5 | `order_items` | `/order` checkout (line items) | `INSERT` (public) |

> **Auth** (`auth.users`) is created automatically by Supabase — you do **not** create it.

---

## 1. `newsletter_subscribers`

Stores email addresses of people who subscribe to the newsletter.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | `uuid` | `primary key default gen_random_uuid()` | Auto-generated row ID |
| `email` | `text` | `not null`, `unique` | Subscriber's email |
| `created_at` | `timestamptz` | `default now()` | When they subscribed |

**Row Level Security:** enabled. Anyone may insert; nobody can read via the client.

```sql
create table if not exists public.newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  created_at timestamptz default now()
);

alter table public.newsletter_subscribers enable row level security;

create policy "Anyone can subscribe"
  on public.newsletter_subscribers for insert
  with check (true);
```

---

## 2. `contact_messages`

Stores messages submitted from the `/contact` form.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | `uuid` | `primary key default gen_random_uuid()` | Auto-generated row ID |
| `name` | `text` | `not null` | Sender's name |
| `email` | `text` | `not null` | Sender's email |
| `subject` | `text` | — | Subject line (optional) |
| `message` | `text` | `not null` | The message body |
| `created_at` | `timestamptz` | `default now()` | When it was sent |

**Row Level Security:** enabled. Anyone may submit; only signed-in users can read.

```sql
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  subject    text,
  message    text not null,
  created_at timestamptz default now()
);

alter table public.contact_messages enable row level security;

create policy "Anyone can send a message"
  on public.contact_messages for insert
  with check (true);

create policy "Authenticated users can read messages"
  on public.contact_messages for select
  using (auth.role() = 'authenticated');
```

---

## 3. `menu_items`

The product catalogue. Currently the frontend ships menu data in code (`src/data/menuItems.js`), so this table is **optional** — but you can seed it now and switch the pages to read from it later.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | `uuid` | `primary key default gen_random_uuid()` | Auto-generated row ID |
| `name` | `text` | `not null` | Item name (e.g. Cappuccino) |
| `description` | `text` | — | Short description |
| `price` | `numeric(10,2)` | `not null` | Price in dollars |
| `category` | `text` | `not null`, check in `('Hot Coffee','Cold Coffee','Desserts')` | Which menu category |
| `image_url` | `text` | — | Public image URL (optional) |
| `badge` | `text` | — | e.g. "Bestseller", "New" (optional) |
| `is_available` | `boolean` | `default true` | Whether it can be ordered |
| `created_at` | `timestamptz` | `default now()` | When it was added |

**Row Level Security:** enabled. Public read; writes are managed by you in the dashboard/Service role.

```sql
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

alter table public.menu_items enable row level security;

create policy "Anyone can view menu"
  on public.menu_items for select
  using (true);
```

**Optional seed data:**

```sql
insert into public.menu_items (name, description, price, category, badge) values
  ('Cappuccino',     'Coffee 50% | Milk 50%',     8.50, 'Hot Coffee',  'Bestseller'),
  ('Chai Latte',     'Coffee 50% | Milk 50%',     8.50, 'Hot Coffee',  null),
  ('Macchiato',      'Coffee 50% | Milk 50%',     8.50, 'Hot Coffee',  null),
  ('Expresso',       'Coffee 50% | Milk 50%',     8.50, 'Hot Coffee',  'New'),
  ('House Blend',    'Signature roasted beans',   7.90, 'Hot Coffee',  null),
  ('Black Coffee',   'Pure & strong',             6.50, 'Hot Coffee',  null),
  ('Iced Cappuccino','Chilled with milk foam',    9.50, 'Cold Coffee', 'Bestseller'),
  ('Iced Latte',     'Espresso over ice',         9.00, 'Cold Coffee', null),
  ('Cold Brew',      'Slow steeped overnight',    8.00, 'Cold Coffee', null),
  ('Mocha Frappe',   'Chocolate & coffee blend',  9.80, 'Cold Coffee', null),
  ('Chocolate Cake', 'Rich cocoa sponge',         6.20, 'Desserts',    'New'),
  ('Brownie',        'Warm & gooey',              5.80, 'Desserts',    null),
  ('Butter Croissant','Freshly baked daily',      4.50, 'Desserts',    null),
  ('Cheesecake',     'Creamy classic',            6.90, 'Desserts',    null);
```

---

## 4. `orders`

Stores one row per checkout submitted on `/order`.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | `uuid` | `primary key default gen_random_uuid()` | Auto-generated order ID |
| `user_id` | `uuid` | `references auth.users on delete set null` | Linked account (null for guests) |
| `customer_name` | `text` | `not null` | Customer's full name |
| `email` | `text` | `not null` | Customer's email |
| `phone` | `text` | `not null` | Contact number |
| `address` | `text` | `not null` | Delivery address |
| `payment_method` | `text` | `not null`, check in `('cash','card')` | How they'll pay |
| `subtotal` | `numeric(10,2)` | `not null` | Sum of items before tax |
| `tax` | `numeric(10,2)` | `not null` | 10% tax |
| `delivery_fee` | `numeric(10,2)` | `not null` | Delivery cost (0 = free) |
| `total` | `numeric(10,2)` | `not null` | Final total |
| `status` | `text` | `default 'pending'`, check in `('pending','confirmed','preparing','delivered','cancelled')` | Order state |
| `created_at` | `timestamptz` | `default now()` | When the order was placed |

**Row Level Security:** enabled. Anyone may place an order; the signed-in customer can read their own.

```sql
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

alter table public.orders enable row level security;

create policy "Anyone can place an order"
  on public.orders for insert
  with check (true);

create policy "Customer can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);
```

---

## 5. `order_items`

The line items for each order (which coffee + how many). Linked to `orders`.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | `uuid` | `primary key default gen_random_uuid()` | Auto-generated row ID |
| `order_id` | `uuid` | `not null references orders on delete cascade` | Parent order (FK) |
| `item_name` | `text` | `not null` | Product name at time of order |
| `quantity` | `int` | `not null`, check `quantity > 0` | How many |
| `price` | `numeric(10,2)` | `not null` | Unit price at time of order |

**Row Level Security:** enabled. Anyone may add items with an order; the customer can read their own items.

```sql
create table if not exists public.order_items (
  id        uuid primary key default gen_random_uuid(),
  order_id  uuid not null references public.orders on delete cascade,
  item_name text not null,
  quantity  int  not null check (quantity > 0),
  price     numeric(10,2) not null
);

alter table public.order_items enable row level security;

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
```

---

## Table relationships

```
orders 1 ──── * order_items
  │  (order_id foreign key, cascade delete)
  └─── user_id ────> auth.users   (optional, set on delete null)

newsletter_subscribers   (standalone)
contact_messages         (standalone)
menu_items               (standalone)
```

---

## Copy-paste master script

Run this whole block once in **SQL Editor** to create everything:

```sql
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  created_at timestamptz default now()
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null,
  category text not null check (category in ('Hot Coffee', 'Cold Coffee', 'Desserts')),
  image_url text,
  badge text,
  is_available boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete set null,
  customer_name text not null,
  email text not null,
  phone text not null,
  address text not null,
  payment_method text not null check (payment_method in ('cash', 'card')),
  subtotal numeric(10,2) not null,
  tax numeric(10,2) not null,
  delivery_fee numeric(10,2) not null,
  total numeric(10,2) not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'preparing', 'delivered', 'cancelled')),
  created_at timestamptz default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders on delete cascade,
  item_name text not null,
  quantity int not null check (quantity > 0),
  price numeric(10,2) not null
);

alter table public.newsletter_subscribers enable row level security;
alter table public.contact_messages enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Anyone can subscribe"
  on public.newsletter_subscribers for insert with check (true);

create policy "Anyone can send a message"
  on public.contact_messages for insert with check (true);

create policy "Authenticated users can read messages"
  on public.contact_messages for select using (auth.role() = 'authenticated');

create policy "Anyone can view menu"
  on public.menu_items for select using (true);

create policy "Anyone can place an order"
  on public.orders for insert with check (true);

create policy "Customer can view own orders"
  on public.orders for select using (auth.uid() = user_id);

create policy "Anyone can add order items"
  on public.order_items for insert with check (true);

create policy "Customer can view own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );
```

---

## Useful verification queries

```sql
-- All orders with their items
select o.id, o.customer_name, o.total, o.status, o.created_at,
       json_agg(json_build_object('name', oi.item_name, 'qty', oi.quantity, 'price', oi.price)) as items
from public.orders o
join public.order_items oi on oi.order_id = o.id
group by o.id
order by o.created_at desc;

-- Latest newsletter subscribers
select * from public.newsletter_subscribers order by created_at desc;

-- Contact messages
select * from public.contact_messages order by created_at desc;

-- Menu items
select * from public.menu_items where is_available order by category, name;
```
