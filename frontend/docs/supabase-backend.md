# Bean Scene — Supabase Backend Setup Guide

This document describes how to create and configure the Supabase backend for the **Bean Scene** coffee shop frontend (React + Vite + Tailwind).

The frontend already includes the Supabase client wiring. After following this guide the following features become live:

| Feature | Page | Supabase feature |
| --- | --- | --- |
| Sign up / Sign in / Sign out | `/signup`, `/signin` | Auth (email + password) |
| Place an order | `/order` | `orders` + `order_items` tables |
| Contact form | `/contact` | `contact_messages` table |
| Newsletter | Home (Newsletter section) | `newsletter_subscribers` table |
| Menu data | `/menu`, Home | `menu_items` table (optional) |

> If Supabase is **not configured** (no env vars), the app keeps working in a "demo" mode — forms just show the success screen without saving anything.

---

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**.
2. Choose an organisation, a name (e.g. `bean-scene`), a database password and a region close to your users.
3. Wait for the project to finish provisioning (a minute or two).

## 2. Get your API credentials

1. In the dashboard open **Project Settings → API**.
2. Copy:
   - **Project URL** — e.g. `https://xyzcompany.supabase.co`
   - **anon** `public` key (NOT the `service_role` key — it bypasses security).

## 3. Configure the frontend

1. Copy `.env.example` to `.env` in the project root (`frontend/`):

```bash
# frontend/
cp .env.example .env
```

2. Fill in your values:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

3. Restart the dev server (`npm run dev`). The `.env` file is already git-ignored — never commit it.

The client is created in `src/lib/supabase.js`:

```js
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null
```

## 4. Enable Email authentication

1. **Authentication → Providers → Email**.
2. Turn it **On**.
3. If you want users to log in immediately without clicking a confirmation link, go to **Authentication → Settings** and disable **"Confirm email"** (recommended for development).
4. Under **Authentication → URL Configuration**, set the Site URL to `http://localhost:5173` (and add any production URL later).

## 5. Create the database tables

> **All tables, their columns, types, and policies are documented in [`supabase-tables.md`](./supabase-tables.md).** You can also paste the master SQL script from there into the SQL Editor to create everything at once.

Open **SQL Editor → New query**, paste and run the script below:

```sql
-- ============================================================
-- Bean Scene backend schema
-- Run in Supabase SQL Editor
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

create policy "Staff can view all orders"
  on public.orders for select
  using (auth.role() = 'authenticated');

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
```

> **Note:** The RLS policies above are intentionally permissive for a starter app (anyone can insert orders/messages/subscriptions). If you only want **authenticated** users to place orders, change the `orders` insert policy to `with check (auth.uid() is not null)`.

## 6. (Optional) Seed the menu table

The frontend currently ships menu data in `src/data/menuItems.js`. If you want to drive the menu from the database later, seed `menu_items` and switch the page queries to Supabase. Example seed:

```sql
insert into public.menu_items (name, description, price, category, badge) values
  ('Cappuccino',    'Coffee 50% | Milk 50%',      8.50, 'Hot Coffee',  'Bestseller'),
  ('Chai Latte',    'Coffee 50% | Milk 50%',      8.50, 'Hot Coffee',  null),
  ('Macchiato',     'Coffee 50% | Milk 50%',      8.50, 'Hot Coffee',  null),
  ('Expresso',      'Coffee 50% | Milk 50%',      8.50, 'Hot Coffee',  'New'),
  ('Iced Cappuccino','Chilled with milk foam',    9.50, 'Cold Coffee', 'Bestseller'),
  ('Cold Brew',     'Slow steeped overnight',     8.00, 'Cold Coffee', null),
  ('Brownie',       'Warm & gooey',               5.80, 'Desserts',    null);
```

## 7. (Optional) Storage for product images

1. **Storage → New bucket** → name `menu-images`, set **Public**.
2. Add a policy allowing public reads:
   ```sql
   create policy "Public read menu images"
     on storage.objects for select
     using (bucket_id = 'menu-images');
   ```
3. Upload images and store the public URL in `menu_items.image_url`.

## 8. How the frontend calls Supabase

- **Auth** — `src/context/AuthContext.jsx` wraps the whole app, listens to `supabase.auth.onAuthStateChange`, and exposes `{ user, loading, signOut }`. The `NavBar` shows the user's email + **Sign Out** when logged in.
- **Sign in / Sign up** — `src/pages/SignIn.jsx`, `src/pages/SignUp.jsx` call `supabase.auth.signInWithPassword()` / `signUp()` and show errors inline.
- **Orders** — `src/pages/OrderNow.jsx` inserts into `orders` then `order_items` in one flow.
- **Contact** — `src/pages/Contact.jsx` inserts into `contact_messages`.
- **Newsletter** — `src/components/Newsletter.jsx` inserts into `newsletter_subscribers` (handles duplicate-email errors).

## 9. Verify it works

1. `npm run dev` with your `.env` in place.
2. Sign up → confirm email (if enabled) → you should appear in **Authentication → Users**.
3. Place an order → check the row appears in **Table Editor → orders** (and `order_items`).
4. Send the contact form / subscribe → check `contact_messages` / `newsletter_subscribers`.

## 10. Useful dashboard areas

- **Table Editor** — browse/edit `orders`, `contact_messages`, `newsletter_subscribers`, `menu_items`.
- **Authentication → Users** — manage accounts, disable email confirmation.
- **SQL Editor** — run the schema script above and any custom queries.
- **Database → Row Level Security** — review/adjust the policies.
