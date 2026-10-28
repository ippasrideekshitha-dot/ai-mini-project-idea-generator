-- AI Mini Project Idea Generator (IdeaSpark)
-- Run this script in the Supabase SQL Editor.
-- The backend uses a server-only service role key and performs ownership checks in every private route.
-- Do not expose the service role key. These tables are not directly accessible to browser clients.

create extension if not exists pgcrypto;

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  name varchar(80) not null check (char_length(trim(name)) between 2 and 80),
  email varchar(254) not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.saved_ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  catalog_id varchar(80),
  title varchar(120) not null check (char_length(trim(title)) between 3 and 120),
  description varchar(1000) not null check (char_length(trim(description)) between 10 and 1000),
  domain varchar(30) not null check (domain in ('web','ai','iot','security','education','health','environment','productivity')),
  difficulty varchar(20) not null check (difficulty in ('beginner','intermediate','advanced')),
  technologies text[] not null check (cardinality(technologies) between 1 and 8),
  steps text[] not null check (cardinality(steps) between 1 and 8),
  created_at timestamptz not null default now(),
  constraint saved_ideas_catalog_unique unique (user_id, catalog_id)
);

create index if not exists saved_ideas_user_created_idx
  on public.saved_ideas (user_id, created_at desc);

-- RLS is enabled as defence in depth. Browser clients cannot access these tables directly;
-- the Express server uses a secret server-side key and explicitly scopes queries by user_id.
alter table public.app_users enable row level security;
alter table public.saved_ideas enable row level security;

-- No anon/authenticated policies are created intentionally. Access goes through Express only.
-- The Supabase service role bypasses RLS, so backend ownership checks are mandatory.
