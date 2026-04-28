-- Run this in your Supabase SQL editor

create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  platform text not null default '',
  model text not null default '',
  login_method text not null default 'browser' check (login_method in ('app', 'browser')),
  browser text not null default '',
  device text not null default '',
  limit_type text not null default 'messages',
  limit_total integer not null default 10,
  limit_used integer not null default 0,
  reset_at timestamptz,
  status text not null default 'ready' check (status in ('ready', 'limited', 'exhausted')),
  category_tags text[] not null default '{}',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  account_id uuid not null references accounts(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'abandoned')),
  priority text not null default 'medium' check (priority in ('urgent', 'high', 'medium', 'low')),
  due_date date,
  conversation_url text,
  continued_from_project_id uuid references projects(id) on delete set null,
  context_snapshot text,
  domain_tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  due_date date,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists project_history (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  change_summary text not null,
  created_at timestamptz not null default now()
);

create table if not exists ideas (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  project_id uuid references projects(id) on delete set null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
