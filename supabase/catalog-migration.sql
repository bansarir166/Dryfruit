-- Catalog + coupons for admin-managed storefront
-- Run in Supabase SQL Editor AFTER profiles/orders schema exists
-- https://supabase.com/dashboard/project/dbcerumokacmuldjqear/sql

create table if not exists public.products (
  id text primary key,
  slug text not null unique,
  name text not null,
  category text not null,
  origin text not null default '',
  tagline text not null default '',
  description text not null default '',
  details text not null default '',
  ingredients text not null default '',
  nutrition jsonb not null default '[]'::jsonb,
  storage text not null default '',
  shipping text not null default '',
  rating numeric not null default 0,
  review_count integer not null default 0,  
  images jsonb not null default '[]'::jsonb,
  variants jsonb not null default '[]'::jsonb,
  featured boolean not null default false,
  bestseller boolean not null default false,
  reviews jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_active_idx on public.products (active);

alter table public.products enable row level security;

drop policy if exists "Public can view active products" on public.products;
create policy "Public can view active products"
  on public.products for select
  using (active = true or public.is_admin());

drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products"
  on public.products for insert
  with check (public.is_admin());

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products"
  on public.products for update
  using (public.is_admin());

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
  on public.products for delete
  using (public.is_admin());

create table if not exists public.coupons (
  code text primary key,
  percent numeric not null check (percent > 0 and percent <= 1),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.coupons enable row level security;

drop policy if exists "Public can view active coupons" on public.coupons;
create policy "Public can view active coupons"
  on public.coupons for select
  using (active = true or public.is_admin());

drop policy if exists "Admins can insert coupons" on public.coupons;
create policy "Admins can insert coupons"
  on public.coupons for insert
  with check (public.is_admin());

drop policy if exists "Admins can update coupons" on public.coupons;
create policy "Admins can update coupons"
  on public.coupons for update
  using (public.is_admin());

drop policy if exists "Admins can delete coupons" on public.coupons;
create policy "Admins can delete coupons"
  on public.coupons for delete
  using (public.is_admin());

insert into public.coupons (code, percent, active)
values
  ('NOURA10', 0.10, true),
  ('GIFT20', 0.20, true)
on conflict (code) do nothing;
