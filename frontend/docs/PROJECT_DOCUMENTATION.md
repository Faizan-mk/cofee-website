# ☕ Bean Scene — Full Project Documentation

A complete guide to the **Bean Scene** coffee shop web app. Give this document to Claude (or any developer/LLM) to understand the project and build/configure the **Supabase backend** step by step.

---

## 1. Project Overview

**Bean Scene** is a coffee shop landing + ordering website. Customers can:

- Browse the menu and filter by category
- Build an order (cart) with quantities
- Checkout with delivery details + payment method
- Subscribe to the newsletter
- Send a contact message
- Create an account / sign in / sign out

The **frontend is 100% built and working**. The **backend is Supabase**, which is **not yet configured** — that's what this guide helps you create.

The frontend currently runs in **"demo mode"**: if Supabase is not configured (missing env vars), all forms still show success screens but save nothing. Once Supabase is set up, everything saves for real.

---

## 2. Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | React 19 (Vite) |
| Language | JavaScript (JSX) |
| Styling | Tailwind CSS v4 |
| Routing | react-router-dom v7 |
| Backend | Supabase (Postgres + Auth + Storage) |
| Supabase client | `@supabase/supabase-js` |
| Package manager | npm |

---

## 3. Project Structure

```
frontend/
├── index.html                  # HTML shell, fonts, meta tags
├── .env.example                # Copy to .env and fill in Supabase keys
├── vite.config.js              # Vite + React + Tailwind plugins
├── public/
│   └── favicon.svg             # Coffee cup favicon
├── docs/
│   ├── supabase-backend.md     # Backend setup guide
│   └── supabase-tables.md      # All table definitions + SQL
└── src/
    ├── main.jsx                # Entry point, wraps app in <AuthProvider>
    ├── App.jsx                 # Router + page titles
    ├── index.css               # Tailwind, fonts, custom utilities
    ├── assets/
    │   ├── images.js           # Exports all local image files
    │   └── images/             # Downloaded image assets
    ├── components/
    │   ├── Layout.jsx          # NavBar + page + Footer shell
    │   ├── NavBar.jsx          # Responsive navbar (auth-aware)
    │   ├── Footer.jsx          # Footer with socials + links
    │   ├── Button.jsx          # Reusable button (button or router Link)
    │   ├── Hero.jsx, Discover.jsx, MenuSection.jsx,
    │   ├── WhyDifferent.jsx, MorningCta.jsx,
    │   ├── Testimonials.jsx, Newsletter.jsx   # Home sections
    │   ├── PageHero.jsx, SectionTitle.jsx     # Shared section helpers
    │   ├── MenuCard.jsx        # Menu product card
    │   ├── AuthCard.jsx        # Sign in/up card shell
    │   └── ScrollToTop.jsx     # Scrolls to top on route change
    ├── context/
    │   ├── auth.js             # AuthContext + useAuth() hook
    │   └── AuthContext.jsx     # AuthProvider (Supabase auth listener)
    ├── data/
    │   └── menuItems.js        # Menu data (in code) + money() helper
    ├── lib/
    │   └── supabase.js         # Supabase client (null if no env keys)
    └── pages/
        ├── Home.jsx            # Landing page (all sections)
        ├── Menu.jsx            # Categorized menu
        ├── About.jsx           # Story + stats + features
        ├── Contact.jsx         # Contact form → contact_messages
        ├── OrderNow.jsx        # Cart + checkout → orders/order_items
        ├── SignIn.jsx          # Login → Supabase auth
        ├── SignUp.jsx          # Register → Supabase auth
        └── NotFound.jsx        # 404 page
```

---

## 4. Pages & Routes

| Route | Page | Backend interaction |
| --- | --- | --- |
| `/` | Home (Hero, Discover, Menu, Why Different, CTA, Testimonials, Newsletter) | Newsletter subscribe |
| `/menu` | Menu with category filter | — (data is in code) |
| `/about` | About / story | — |
| `/contact` | Contact form | `INSERT contact_messages` |
| `/order` | Cart + checkout | `INSERT orders` + `INSERT order_items` |
| `/signin` | Sign in | Supabase Auth |
| `/signup` | Sign up | Supabase Auth |
| `*` | 404 page | — |

---

## 5. Frontend ⇄ Backend Contracts

These are the **exact** calls the frontend makes. The backend must match them.

### 5.1 Supabase client

File: `src/lib/supabase.js`

```js
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null
```

If `supabase` is `null`, the app uses demo mode (no network calls).

### 5.2 Authentication

- **Sign up** (`src/pages/SignUp.jsx`):
  ```js
  await supabase.auth.signUp({ email, password })
  ```
  - If `data.session` is null → email confirmation is enabled; show "check your email".
  - If error → show `error.message` inline.
- **Sign in** (`src/pages/SignIn.jsx`):
  ```js
  await supabase.auth.signInWithPassword({ email, password })
  ```
- **Sign out** (`src/context/AuthContext.jsx`): `await supabase.auth.signOut()`
- **Session state**: `supabase.auth.getSession()` + `supabase.auth.onAuthStateChange()`.
  The `NavBar` shows the user's email + **Sign Out** when logged in.

> Requirement: **Email + password** provider enabled. Optionally disable email confirmation for dev.

### 5.3 Orders (checkout)

File: `src/pages/OrderNow.jsx`

**Step 1 — insert order** into `orders`:

```js
const order = {
  customer_name: form.get("name"),
  email: form.get("email"),
  phone: form.get("phone"),
  address: form.get("address"),
  payment_method: payment,          // "cash" | "card"
  subtotal,                          // number
  tax,                               // number
  delivery_fee,                      // number
  total,                             // number
}
const { data: created, error } = await supabase
  .from("orders")
  .insert(order)
  .select()
  .single()
```

**Step 2 — insert line items** into `order_items` (must reference the created order):

```js
const items = cartEntries.map(([name, q]) => {
  const item = menuItems.find((i) => i.name === name)
  return { order_id: created.id, item_name: name, quantity: q, price: item?.price ?? 0 }
})
await supabase.from("order_items").insert(items)
```

### 5.4 Contact messages

File: `src/pages/Contact.jsx`

```js
await supabase.from("contact_messages").insert({ name, email, subject, message })
```

### 5.5 Newsletter

File: `src/components/Newsletter.jsx`

```js
await supabase.from("newsletter_subscribers").insert({ email })
```

The frontend detects a "duplicate" error and shows "This email is already subscribed."

### 5.6 Menu (optional)

Menu data currently lives in `src/data/menuItems.js` (14 items, `name`, `desc`, `price` number, `img`, `category`, `badge`). The frontend **does not** currently fetch menu from Supabase. If you want a database-driven menu later, use the `menu_items` table.

---

## 6. Business Rules (currently computed in the frontend)

| Rule | Value |
| --- | --- |
| Tax | 10% of subtotal |
| Delivery fee | $2.50 (free when subtotal > $25) |
| Total | subtotal + tax + delivery |
| Payment methods | `cash`, `card` |
| Order status flow | pending → confirmed → preparing → delivered / cancelled |

---

## 7. Environment Variables

Create `.env` from `.env.example` in the project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

> Never commit `.env`. It is already in `.gitignore`.

---

## 8. Supabase Backend Setup — Step by Step

### Step 8.1 — Create the project

1. Go to [supabase.com](https://supabase.com) → **New project**.
2. Organisation name → project name `bean-scene` → strong database password → region.
3. Wait ~1–2 minutes for provisioning.

### Step 8.2 — Get the API keys

1. **Project Settings → API**
2. Copy **Project URL** and the **anon public** key.
3. Put them into `.env`.

### Step 8.3 — Enable email auth

1. **Authentication → Providers → Email → Enable**.
2. **Authentication → Settings**: turn **off "Confirm email"** for instant dev sign-in (optional).
3. **Authentication → URL Configuration**: set Site URL to `http://localhost:5173`.

### Step 8.4 — Create the tables

Open **SQL Editor** and run the master script (also in `docs/supabase-tables.md`):

```sql
-- 1) Newsletter
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz default now()
);

-- 2) Contact
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  created_at timestamptz default now()
);

-- 3) Menu (optional)
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

-- 4) Orders
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

-- 5) Order items
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders on delete cascade,
  item_name text not null,
  quantity int not null check (quantity > 0),
  price numeric(10,2) not null
);

-- Enable Row Level Security
alter table public.newsletter_subscribers enable row level security;
alter table public.contact_messages enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Policies
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

> ⚠️ **Security note:** These policies are intentionally permissive (anyone can insert) to match guest checkout + public forms. For stricter rules, change insert policies to `with check (auth.uid() is not null)`.

### Step 8.5 — Seed the menu (optional)

```sql
insert into public.menu_items (name, description, price, category, badge) values
  ('Cappuccino',     'Coffee 50% | Milk 50%',     8.50, 'Hot Coffee',  'Bestseller'),
  ('Chai Latte',     'Coffee 50% | Milk 50%',     8.50, 'Hot Coffee',  null),
  ('Macchiato',      'Coffee 50% | Milk 50%',     8.50, 'Hot Coffee',  null),
  ('Expresso',       'Coffee 50% | Milk 50%',     8.50, 'Hot Coffee',  'New'),
  ('Iced Cappuccino','Chilled with milk foam',    9.50, 'Cold Coffee', 'Bestseller'),
  ('Cold Brew',      'Slow steeped overnight',    8.00, 'Cold Coffee', null),
  ('Brownie',        'Warm & gooey',              5.80, 'Desserts',    null);
```

### Step 8.6 — Storage for images (optional)

1. **Storage → New bucket** → name `menu-images`, set **Public**.
2. Policy for public reads:
   ```sql
   create policy "Public read menu images"
     on storage.objects for select
     using (bucket_id = 'menu-images');
   ```

---

## 9. Verification Checklist

After setup, confirm each flow works:

- [ ] `npm install` and `npm run dev` start without errors
- [ ] `.env` has real Supabase URL + anon key
- [ ] **Sign up** → user appears in **Authentication → Users**
- [ ] **Sign in** → navbar shows the email + **Sign Out**
- [ ] **Place order** → row appears in `orders` + `order_items`
- [ ] **Contact form** → row in `contact_messages`
- [ ] **Newsletter** → row in `newsletter_subscribers`
- [ ] No browser console errors related to Supabase / RLS

**Test queries (SQL Editor):**

```sql
select o.id, o.customer_name, o.total, o.status,
       json_agg(json_build_object('item', oi.item_name, 'qty', oi.quantity)) as items
from public.orders o
join public.order_items oi on oi.order_id = o.id
group by o.id order by o.created_at desc;

select * from public.contact_messages order by created_at desc;
select * from public.newsletter_subscribers order by created_at desc;
```

---

## 10. Common Errors & Fixes

| Symptom | Cause / Fix |
| --- | --- |
| Forms still "demo" / nothing saved | `.env` missing or wrong → check `VITE_SUPABASE_URL` / key |
| `relation "public.orders" does not exist` | Tables not created — run the SQL script in Step 8.4 |
| Insert fails with RLS policy error | Policies missing — run the policy SQL |
| Sign up says "check your email" but no email arrives | Email confirmation enabled → disable in Auth Settings, or check emails in Auth → Messages |
| `new row violates row-level security policy` | Policy `with check` doesn't allow the insert |
| 401/403 on anon key | Using the `service_role` key instead of the `anon` key |

---

## 11. Going to Production

1. **Build:** `npm run build` → outputs `dist/`.
2. **Deploy `dist/`** to Vercel / Netlify / Cloudflare Pages / any static host.
3. Add the production URL to **Authentication → URL Configuration**.
4. Set the same env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) on the host.
5. For a database-driven menu, update `src/pages/Menu.jsx` + `MenuSection.jsx` to `select` from `menu_items`.

---

## 12. Related Documents

- `docs/supabase-backend.md` — concise backend setup guide
- `docs/supabase-tables.md` — every table, column, policy + master SQL script
- `.env.example` — env template

---

*End of documentation. Ready to give to Claude to build/configure the Bean Scene Supabase backend.*
