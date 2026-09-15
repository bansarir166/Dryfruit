-- NOURA Analytics Migration
-- Run this in Supabase SQL Editor to enable persistent database storage for analytics:
-- https://supabase.com/dashboard/project/dbcerumokacmuldjqear/sql

-- Analytics Events Table
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null,
  session_id text not null,
  is_returning boolean not null default false,
  event_type text not null default 'page_view',
  page_path text not null,
  page_title text,
  referrer text,
  traffic_source text default 'direct',
  traffic_medium text default 'none',
  traffic_campaign text,
  device_category text default 'desktop',
  browser text,
  os text,
  country text default 'India',
  city text default 'Mumbai',
  screen_resolution text,
  engagement_time_sec integer default 0,
  scroll_depth_percent integer default 0,
  created_at timestamptz not null default now()
);

-- Indexes for lightning-fast queries
create index if not exists idx_analytics_created_at on public.analytics_events (created_at desc);
create index if not exists idx_analytics_visitor_id on public.analytics_events (visitor_id);
create index if not exists idx_analytics_session_id on public.analytics_events (session_id);
create index if not exists idx_analytics_event_type on public.analytics_events (event_type);
create index if not exists idx_analytics_page_path on public.analytics_events (page_path);
create index if not exists idx_analytics_traffic_source on public.analytics_events (traffic_source);
create index if not exists idx_analytics_country on public.analytics_events (country);

-- Enable Row Level Security (RLS)
alter table public.analytics_events enable row level security;

-- Allow anon & authenticated visitors to insert tracking events
drop policy if exists "Allow public insertion of analytics events" on public.analytics_events;
create policy "Allow public insertion of analytics events"
  on public.analytics_events for insert
  with check (true);

-- Allow only admins to read analytics data
drop policy if exists "Allow admins to read analytics events" on public.analytics_events;
create policy "Allow admins to read analytics events"
  on public.analytics_events for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
