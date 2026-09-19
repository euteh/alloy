-- Alloy B2B Platform — schema Faza 1+2 (Fundatie + Catalog)
-- Roluri: admin (Alloy) / client_b2b (companie client). Izolare pe company_id
-- impusa la nivel de baza de date (RLS), nu doar in frontend.

create extension if not exists pgcrypto;
create extension if not exists pg_trgm; -- pentru cautare partiala/tolerant (Faza 4)

-- ---------------------------------------------------------------------------
-- COMPANIES (clienti B2B ai Alloy)
-- ---------------------------------------------------------------------------
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  cui text not null unique,
  address text,
  city text,
  country text not null default 'Romania',
  contact_person text,
  email text,
  phone text,
  status text not null default 'pending' check (status in ('active', 'inactive', 'pending')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- APP_USERS (extensie peste auth.users; role + apartenenta la companie)
-- Un rand per auth.users.id. Admin: company_id = NULL. Client B2B: company_id NOT NULL.
-- ---------------------------------------------------------------------------
create table public.app_users (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null check (role in ('admin', 'client_b2b')),
  status text not null default 'active' check (status in ('active', 'disabled')),
  created_at timestamptz not null default now(),
  constraint client_b2b_requires_company
    check (role = 'admin' or company_id is not null)
);

create index app_users_company_idx on public.app_users (company_id);

-- ---------------------------------------------------------------------------
-- PRODUCT_CATEGORIES
-- ---------------------------------------------------------------------------
create table public.product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  active boolean not null default true
);

-- ---------------------------------------------------------------------------
-- PRODUCTS — sku e cheia naturala pentru sincronizarea viitoare (upsert on sku).
-- ---------------------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  short_description text,
  description text,
  category_id uuid references public.product_categories(id) on delete set null,
  base_price numeric(12, 2) not null check (base_price >= 0),
  -- unitatea in care se vinde produsul (mockup: sarma/electrozi se vand la kg,
  -- alte produse la bucata) — determina daca UI-ul arata "/kg" langa pret.
  unit text not null default 'buc' check (unit in ('buc', 'kg', 'set', 'ml')),
  technical_sheet_url text,
  image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index products_category_idx on public.products (category_id);
-- Cautare full-text simpla (nume + sku), extinsa la Faza 4 (trigram pentru toleranta la typo-uri).
create index products_name_trgm_idx on public.products using gin (name gin_trgm_ops);
create index products_sku_trgm_idx on public.products using gin (sku gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- CLIENT_CATEGORY_DISCOUNTS — discount per (companie, categorie). Lipsa randului = 0%.
-- ---------------------------------------------------------------------------
create table public.client_category_discounts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  category_id uuid not null references public.product_categories(id) on delete cascade,
  discount_percentage numeric(5, 2) not null default 0 check (discount_percentage >= 0 and discount_percentage <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, category_id)
);

-- ---------------------------------------------------------------------------
-- ORDERS + ORDER_ITEMS — snapshot de pret la momentul comenzii (imutabil).
-- ---------------------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete restrict,
  user_id uuid not null references public.app_users(id) on delete restrict,
  order_number text not null unique,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'confirmed', 'cancelled')),
  subtotal numeric(12, 2) not null default 0,
  discount_total numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_company_idx on public.orders (company_id);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  base_unit_price numeric(12, 2) not null,
  discount_percentage numeric(5, 2) not null default 0,
  final_unit_price numeric(12, 2) not null,
  line_total numeric(12, 2) not null
);

create index order_items_order_idx on public.order_items (order_id);

-- ---------------------------------------------------------------------------
-- Helper: rolul si compania utilizatorului curent (SECURITY DEFINER, evita
-- recursivitatea RLS care ar aparea daca politicile ar interoga app_users direct).
-- ---------------------------------------------------------------------------
create or replace function public.current_app_role()
returns text
language sql security definer stable
set search_path = public
as $$
  select role from public.app_users where id = auth.uid();
$$;

create or replace function public.current_app_company()
returns uuid
language sql security definer stable
set search_path = public
as $$
  select company_id from public.app_users where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql security definer stable
set search_path = public
as $$
  select coalesce((select role from public.app_users where id = auth.uid()) = 'admin', false);
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.companies enable row level security;
alter table public.app_users enable row level security;
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.client_category_discounts enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- companies: admin vede tot; un client_b2b isi vede DOAR propria companie.
create policy "companies_admin_all" on public.companies for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "companies_self_select" on public.companies for select to authenticated
  using (id = public.current_app_company());

-- app_users: admin vede/gestioneaza tot; un client_b2b isi vede doar colegii din compania lui.
create policy "app_users_admin_all" on public.app_users for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "app_users_self_company_select" on public.app_users for select to authenticated
  using (company_id = public.current_app_company());

-- product_categories, products: catalog comun, vizibil tuturor utilizatorilor autentificati
-- (produsele nu sunt izolate per client — doar preturile/discounturile sunt).
-- Scriere doar admin.
create policy "categories_read_all" on public.product_categories for select to authenticated using (true);
create policy "categories_admin_write" on public.product_categories for insert to authenticated with check (public.is_admin());
create policy "categories_admin_update" on public.product_categories for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "categories_admin_delete" on public.product_categories for delete to authenticated using (public.is_admin());

create policy "products_read_all" on public.products for select to authenticated using (true);
create policy "products_admin_write" on public.products for insert to authenticated with check (public.is_admin());
create policy "products_admin_update" on public.products for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "products_admin_delete" on public.products for delete to authenticated using (public.is_admin());

-- client_category_discounts: admin gestioneaza tot; clientul isi vede DOAR discounturile proprii.
create policy "discounts_admin_all" on public.client_category_discounts for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "discounts_self_select" on public.client_category_discounts for select to authenticated
  using (company_id = public.current_app_company());

-- orders: admin vede tot; clientul vede/creeaza DOAR comenzile propriei companii.
-- IMPORTANT: company_id la insert e fortat server-side (nu vine din payload-ul clientului) —
-- clauza WITH CHECK previne un client sa scrie o comanda cu company_id-ul altcuiva chiar
-- daca ar incerca sa manipuleze payload-ul din browser.
create policy "orders_admin_all" on public.orders for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "orders_self_select" on public.orders for select to authenticated
  using (company_id = public.current_app_company());
create policy "orders_self_insert" on public.orders for insert to authenticated
  with check (company_id = public.current_app_company() and user_id = auth.uid());

-- order_items: mostenesc izolarea prin order_id (join la orders).
create policy "order_items_admin_all" on public.order_items for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "order_items_self_select" on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and o.company_id = public.current_app_company()));
create policy "order_items_self_insert" on public.order_items for insert to authenticated
  with check (exists (select 1 from public.orders o where o.id = order_id and o.company_id = public.current_app_company()));

grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
