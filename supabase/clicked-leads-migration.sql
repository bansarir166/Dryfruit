-- Clicked Leads Migration for NOURA Outreach
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/dbcerumokacmuldjqear/sql

create table if not exists public.clicked_leads (
  id text primary key,
  email text not null unique,
  business_name text not null,
  owner text,
  city text,
  country text,
  click_count integer not null default 1,
  first_clicked_at timestamptz not null default now(),
  last_clicked_at timestamptz not null default now(),
  last_ip text,
  status text not null default 'HOT_LEAD',
  notes text,
  created_at timestamptz not null default now()
);

-- Indexes for quick lookup
create index if not exists idx_clicked_leads_email on public.clicked_leads (email);
create index if not exists idx_clicked_leads_last_clicked on public.clicked_leads (last_clicked_at desc);
create index if not exists idx_clicked_leads_status on public.clicked_leads (status);

-- Row Level Security
alter table public.clicked_leads enable row level security;

-- Allow public insertion/upsertion when tracking clicks
drop policy if exists "Allow public upsert of clicked leads" on public.clicked_leads;
create policy "Allow public upsert of clicked leads"
  on public.clicked_leads for insert
  with check (true);

drop policy if exists "Allow public update of clicked leads" on public.clicked_leads;
create policy "Allow public update of clicked leads"
  on public.clicked_leads for update
  using (true);

-- Allow admins to read all leads
drop policy if exists "Allow admins to read clicked leads" on public.clicked_leads;
create policy "Allow admins to read clicked leads"
  on public.clicked_leads for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
