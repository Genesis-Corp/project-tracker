create table if not exists public.accounts (
  id text primary key,
  name text not null,
  platform text not null,
  model text not null,
  login_method text not null check (login_method in ('Browser', 'Desktop App', 'Mobile App')),
  browser text default '',
  device text default '',
  limit_type text default '',
  usage_current integer not null default 0,
  usage_limit integer not null default 1,
  reset_at timestamptz default null,
  tags text[] not null default '{}',
  status text not null check (status in ('Ready', 'Limited', 'Exhausted'))
);

create table if not exists public.projects (
  id text primary key,
  name text not null,
  account_id text references public.accounts(id) on delete set null,
  continued_from_account_id text references public.accounts(id) on delete set null,
  status text not null check (status in ('Inbox', 'Active', 'Waiting', 'Blocked', 'Done')),
  priority text not null check (priority in ('Urgent', 'High', 'Medium', 'Low')),
  due_date date default null,
  conversation_url text default '',
  context_snapshot text default '',
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id text primary key,
  project_id text not null references public.projects(id) on delete cascade,
  title text not null,
  status text not null check (status in ('todo', 'done')),
  due_date date default null
);

create table if not exists public.ideas (
  id text primary key,
  title text not null,
  body text default '',
  project_id text references public.projects(id) on delete set null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.status_history (
  id text primary key,
  project_id text not null references public.projects(id) on delete cascade,
  label text not null,
  created_at timestamptz not null default now()
);

alter table public.accounts enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.ideas enable row level security;
alter table public.status_history enable row level security;

drop policy if exists "Allow anon read accounts" on public.accounts;
drop policy if exists "Allow anon write accounts" on public.accounts;
drop policy if exists "Allow anon read projects" on public.projects;
drop policy if exists "Allow anon write projects" on public.projects;
drop policy if exists "Allow anon read tasks" on public.tasks;
drop policy if exists "Allow anon write tasks" on public.tasks;
drop policy if exists "Allow anon read ideas" on public.ideas;
drop policy if exists "Allow anon write ideas" on public.ideas;
drop policy if exists "Allow anon read history" on public.status_history;
drop policy if exists "Allow anon write history" on public.status_history;

create policy "Allow anon read accounts" on public.accounts for select using (true);
create policy "Allow anon write accounts" on public.accounts for all using (true) with check (true);
create policy "Allow anon read projects" on public.projects for select using (true);
create policy "Allow anon write projects" on public.projects for all using (true) with check (true);
create policy "Allow anon read tasks" on public.tasks for select using (true);
create policy "Allow anon write tasks" on public.tasks for all using (true) with check (true);
create policy "Allow anon read ideas" on public.ideas for select using (true);
create policy "Allow anon write ideas" on public.ideas for all using (true) with check (true);
create policy "Allow anon read history" on public.status_history for select using (true);
create policy "Allow anon write history" on public.status_history for all using (true) with check (true);
