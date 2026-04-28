# AI Project Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal AI account + project tracker as a Vite + React SPA backed by Supabase.

**Architecture:** Single-page app with four views (Dashboard, Accounts, Projects, Ideas) navigated via sidebar state. Zustand manages client state; Supabase persists all data. No auth required — single-user personal tool.

**Tech Stack:** Vite 8, React 19, TypeScript 6, Tailwind CSS 3, Zustand, Supabase JS v2, lucide-react, date-fns, Vitest.

---

## Task 1: Install dependencies + configure Tailwind

**Files:**
- Modify: `package.json`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Modify: `src/index.css`

- [ ] **Step 1: Install missing packages**

Run from `ai-project-tracker/`:
```bash
npm install zustand
npm install -D tailwindcss@3 postcss autoprefixer vitest @testing-library/react @testing-library/jest-dom jsdom
```
Expected: packages added to node_modules, no errors.

- [ ] **Step 2: Initialise Tailwind**

```bash
npx tailwindcss init -p
```
Expected: `tailwind.config.js` and `postcss.config.js` created.

- [ ] **Step 3: Write `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0f0f13',
        surface: '#1a1a24',
        'surface-2': '#242433',
        accent: {
          account: '#8b5cf6',
          project: '#f97316',
          idea: '#14b8a6',
          task: '#f59e0b',
        },
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 4: Replace `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-bg text-white m-0;
  }
  * {
    box-sizing: border-box;
  }
}

@layer components {
  .input {
    @apply w-full bg-surface-2 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-colors;
  }
  select.input {
    @apply cursor-pointer;
  }
  .btn-primary {
    @apply px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer;
  }
  .btn-secondary {
    @apply px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 text-sm font-medium rounded-xl transition-colors cursor-pointer;
  }
  .btn-danger {
    @apply px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-sm font-medium rounded-xl transition-colors cursor-pointer;
  }
  .card {
    @apply bg-surface rounded-2xl border border-white/10 p-4;
  }
  .section-label {
    @apply text-xs font-medium text-gray-500 uppercase tracking-wider;
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: install dependencies and configure Tailwind"
```

---

## Task 2: Supabase schema + env setup

**Files:**
- Create: `supabase-schema.sql`
- Create: `.env.local`
- Create: `src/env.d.ts`
- Create: `src/lib/supabase.ts`

- [ ] **Step 1: Create `supabase-schema.sql`**

```sql
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
```

- [ ] **Step 2: Run the schema in Supabase**

Open your Supabase project → SQL Editor → paste the contents of `supabase-schema.sql` → Run.
Expected: all 5 tables created with no errors.

- [ ] **Step 3: Create `.env.local`**

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace values with your actual Supabase project URL and anon key (found in Project Settings → API).

- [ ] **Step 4: Create `src/env.d.ts`**

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

- [ ] **Step 5: Create `src/lib/supabase.ts`**

```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)
```

- [ ] **Step 6: Commit**

```bash
git add supabase-schema.sql src/env.d.ts src/lib/supabase.ts
git commit -m "feat: add Supabase schema and client"
```
Note: do NOT commit `.env.local`.

---

## Task 3: TypeScript types

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: Create `src/types/index.ts`**

```typescript
export type AccountStatus = 'ready' | 'limited' | 'exhausted'
export type ProjectStatus = 'active' | 'paused' | 'completed' | 'abandoned'
export type Priority = 'urgent' | 'high' | 'medium' | 'low'
export type TaskStatus = 'todo' | 'in_progress' | 'done'

export interface Account {
  id: string
  name: string
  platform: string
  model: string
  login_method: 'app' | 'browser'
  browser: string
  device: string
  limit_type: string
  limit_total: number
  limit_used: number
  reset_at: string | null
  status: AccountStatus
  category_tags: string[]
  notes: string
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  account_id: string
  status: ProjectStatus
  priority: Priority
  due_date: string | null
  conversation_url: string | null
  continued_from_project_id: string | null
  context_snapshot: string | null
  domain_tags: string[]
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  project_id: string
  title: string
  status: TaskStatus
  due_date: string | null
  sort_order: number
  created_at: string
}

export interface ProjectHistory {
  id: string
  project_id: string
  change_summary: string
  created_at: string
}

export interface Idea {
  id: string
  title: string
  body: string | null
  project_id: string | null
  tags: string[]
  created_at: string
  updated_at: string
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add TypeScript types"
```

---

## Task 4: Countdown utility + Vitest setup

**Files:**
- Modify: `vite.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/lib/countdown.ts`
- Create: `src/lib/countdown.test.ts`

- [ ] **Step 1: Update `vite.config.ts` to add test config**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
})
```

- [ ] **Step 2: Create `src/test/setup.ts`**

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 3: Add vitest types to `tsconfig.app.json`**

Open `tsconfig.app.json` and add `"types": ["vitest/globals"]` inside `compilerOptions`:

```json
{
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}
```
(Merge with existing compilerOptions — do not replace the whole file.)

- [ ] **Step 4: Write the failing tests in `src/lib/countdown.test.ts`**

```typescript
import { describe, it, expect } from 'vitest'
import { formatCountdown, getCountdownColorClass, getSecondsRemaining } from './countdown'

describe('formatCountdown', () => {
  it('returns "Ready" when seconds is 0', () => {
    expect(formatCountdown(0)).toBe('Ready')
  })
  it('returns "Ready" when seconds is Infinity', () => {
    expect(formatCountdown(Infinity)).toBe('Ready')
  })
  it('formats seconds only', () => {
    expect(formatCountdown(45)).toBe('45s')
  })
  it('formats minutes and seconds', () => {
    expect(formatCountdown(125)).toBe('2m 5s')
  })
  it('formats hours, minutes, seconds', () => {
    expect(formatCountdown(3723)).toBe('1h 2m 3s')
  })
})

describe('getCountdownColorClass', () => {
  it('returns green for elapsed (0 seconds)', () => {
    expect(getCountdownColorClass(0)).toBe('text-green-400')
  })
  it('returns red+pulse for under 15 minutes', () => {
    expect(getCountdownColorClass(500)).toContain('text-red-400')
    expect(getCountdownColorClass(500)).toContain('animate-pulse')
  })
  it('returns amber for under 2 hours', () => {
    expect(getCountdownColorClass(3600)).toBe('text-amber-400')
  })
  it('returns white for over 2 hours', () => {
    expect(getCountdownColorClass(10000)).toBe('text-white')
  })
})

describe('getSecondsRemaining', () => {
  it('returns Infinity for null resetAt', () => {
    expect(getSecondsRemaining(null)).toBe(Infinity)
  })
  it('returns 0 for a past timestamp', () => {
    const past = new Date(Date.now() - 5000).toISOString()
    expect(getSecondsRemaining(past)).toBe(0)
  })
  it('returns positive number for a future timestamp', () => {
    const future = new Date(Date.now() + 10000).toISOString()
    expect(getSecondsRemaining(future)).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 5: Run tests — expect them to FAIL**

```bash
npx vitest run src/lib/countdown.test.ts
```
Expected: FAIL with "Cannot find module './countdown'"

- [ ] **Step 6: Create `src/lib/countdown.ts`**

```typescript
export function getSecondsRemaining(resetAt: string | null): number {
  if (!resetAt) return Infinity
  return Math.max(0, Math.floor((new Date(resetAt).getTime() - Date.now()) / 1000))
}

export function formatCountdown(seconds: number): string {
  if (seconds === Infinity || seconds <= 0) return 'Ready'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

export function getCountdownColorClass(seconds: number): string {
  if (seconds <= 0 || seconds === Infinity) return 'text-green-400'
  if (seconds < 900) return 'text-red-400 animate-pulse'
  if (seconds < 7200) return 'text-amber-400'
  return 'text-white'
}
```

- [ ] **Step 7: Run tests — expect PASS**

```bash
npx vitest run src/lib/countdown.test.ts
```
Expected: 11 tests pass.

- [ ] **Step 8: Commit**

```bash
git add vite.config.ts src/test/setup.ts src/lib/countdown.ts src/lib/countdown.test.ts tsconfig.app.json
git commit -m "feat: add countdown utility with Vitest tests"
```

---

## Task 5: Zustand stores

**Files:**
- Create: `src/store/accountStore.ts`
- Create: `src/store/projectStore.ts`
- Create: `src/store/ideaStore.ts`

- [ ] **Step 1: Create `src/store/accountStore.ts`**

```typescript
import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Account } from '../types'

type AccountInput = Omit<Account, 'id' | 'created_at' | 'updated_at'>

interface AccountStore {
  accounts: Account[]
  loading: boolean
  fetch: () => Promise<void>
  add: (data: AccountInput) => Promise<void>
  update: (id: string, updates: Partial<AccountInput>) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useAccountStore = create<AccountStore>((set) => ({
  accounts: [],
  loading: false,

  fetch: async () => {
    set({ loading: true })
    const { data } = await supabase.from('accounts').select('*').order('created_at', { ascending: false })
    set({ accounts: data ?? [], loading: false })
  },

  add: async (data) => {
    const { data: row } = await supabase.from('accounts').insert(data).select().single()
    if (row) set((s) => ({ accounts: [row, ...s.accounts] }))
  },

  update: async (id, updates) => {
    const { data: row } = await supabase
      .from('accounts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (row) set((s) => ({ accounts: s.accounts.map((a) => (a.id === id ? row : a)) }))
  },

  remove: async (id) => {
    await supabase.from('accounts').delete().eq('id', id)
    set((s) => ({ accounts: s.accounts.filter((a) => a.id !== id) }))
  },
}))
```

- [ ] **Step 2: Create `src/store/projectStore.ts`**

```typescript
import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Project, Task, ProjectHistory } from '../types'

type ProjectInput = Omit<Project, 'id' | 'created_at' | 'updated_at'>
type TaskInput = Omit<Task, 'id' | 'created_at'>

interface ProjectStore {
  projects: Project[]
  tasks: Record<string, Task[]>
  history: Record<string, ProjectHistory[]>
  openTaskCount: number
  loading: boolean
  fetch: () => Promise<void>
  add: (data: ProjectInput) => Promise<Project | null>
  update: (id: string, updates: Partial<ProjectInput>) => Promise<void>
  remove: (id: string) => Promise<void>
  fetchTasks: (projectId: string) => Promise<void>
  addTask: (task: TaskInput) => Promise<void>
  updateTask: (id: string, updates: Partial<TaskInput>) => Promise<void>
  removeTask: (id: string, projectId: string) => Promise<void>
  fetchHistory: (projectId: string) => Promise<void>
  fetchOpenTaskCount: () => Promise<void>
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  tasks: {},
  history: {},
  openTaskCount: 0,
  loading: false,

  fetch: async () => {
    set({ loading: true })
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
    set({ projects: data ?? [], loading: false })
  },

  add: async (data) => {
    const { data: row } = await supabase.from('projects').insert(data).select().single()
    if (row) set((s) => ({ projects: [row, ...s.projects] }))
    return row ?? null
  },

  update: async (id, updates) => {
    const current = get().projects.find((p) => p.id === id)
    const { data: row } = await supabase
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (row) {
      const historyEntries: string[] = []
      if (current?.status !== updates.status && updates.status) {
        historyEntries.push(`Status changed to ${updates.status}`)
      }
      if (current?.priority !== updates.priority && updates.priority) {
        historyEntries.push(`Priority changed to ${updates.priority}`)
      }
      for (const summary of historyEntries) {
        await supabase.from('project_history').insert({ project_id: id, change_summary: summary })
      }
      if (historyEntries.length > 0 && get().history[id]) {
        const { data: hist } = await supabase
          .from('project_history')
          .select('*')
          .eq('project_id', id)
          .order('created_at', { ascending: false })
        if (hist) set((s) => ({ history: { ...s.history, [id]: hist } }))
      }
      set((s) => ({ projects: s.projects.map((p) => (p.id === id ? row : p)) }))
    }
  },

  remove: async (id) => {
    await supabase.from('projects').delete().eq('id', id)
    set((s) => {
      const tasks = { ...s.tasks }
      const history = { ...s.history }
      delete tasks[id]
      delete history[id]
      return { projects: s.projects.filter((p) => p.id !== id), tasks, history }
    })
  },

  fetchTasks: async (projectId) => {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order')
    if (data) set((s) => ({ tasks: { ...s.tasks, [projectId]: data } }))
  },

  addTask: async (task) => {
    const { data: row } = await supabase.from('tasks').insert(task).select().single()
    if (row) {
      set((s) => ({
        tasks: {
          ...s.tasks,
          [task.project_id]: [...(s.tasks[task.project_id] ?? []), row],
        },
      }))
    }
  },

  updateTask: async (id, updates) => {
    const { data: row } = await supabase.from('tasks').update(updates).eq('id', id).select().single()
    if (row) {
      set((s) => ({
        tasks: Object.fromEntries(
          Object.entries(s.tasks).map(([pid, list]) => [
            pid,
            list.map((t) => (t.id === id ? row : t)),
          ]),
        ),
      }))
    }
  },

  removeTask: async (id, projectId) => {
    await supabase.from('tasks').delete().eq('id', id)
    set((s) => ({
      tasks: {
        ...s.tasks,
        [projectId]: (s.tasks[projectId] ?? []).filter((t) => t.id !== id),
      },
    }))
  },

  fetchHistory: async (projectId) => {
    const { data } = await supabase
      .from('project_history')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
    if (data) set((s) => ({ history: { ...s.history, [projectId]: data } }))
  },

  fetchOpenTaskCount: async () => {
    const { count } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .in('status', ['todo', 'in_progress'])
    set({ openTaskCount: count ?? 0 })
  },
}))
```

- [ ] **Step 3: Create `src/store/ideaStore.ts`**

```typescript
import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Idea } from '../types'

type IdeaInput = Omit<Idea, 'id' | 'created_at' | 'updated_at'>

interface IdeaStore {
  ideas: Idea[]
  loading: boolean
  fetch: () => Promise<void>
  add: (data: IdeaInput) => Promise<Idea | null>
  update: (id: string, updates: Partial<IdeaInput>) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useIdeaStore = create<IdeaStore>((set) => ({
  ideas: [],
  loading: false,

  fetch: async () => {
    set({ loading: true })
    const { data } = await supabase.from('ideas').select('*').order('created_at', { ascending: false })
    set({ ideas: data ?? [], loading: false })
  },

  add: async (data) => {
    const { data: row } = await supabase.from('ideas').insert(data).select().single()
    if (row) set((s) => ({ ideas: [row, ...s.ideas] }))
    return row ?? null
  },

  update: async (id, updates) => {
    const { data: row } = await supabase
      .from('ideas')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (row) set((s) => ({ ideas: s.ideas.map((i) => (i.id === id ? row : i)) }))
  },

  remove: async (id) => {
    await supabase.from('ideas').delete().eq('id', id)
    set((s) => ({ ideas: s.ideas.filter((i) => i.id !== id) }))
  },
}))
```

- [ ] **Step 4: Commit**

```bash
git add src/store/
git commit -m "feat: add Zustand stores for accounts, projects, and ideas"
```

---

## Task 6: Shared primitive components

**Files:**
- Create: `src/components/shared/StatusBadge.tsx`
- Create: `src/components/shared/PriorityBadge.tsx`
- Create: `src/components/shared/TagBadge.tsx`

- [ ] **Step 1: Create `src/components/shared/StatusBadge.tsx`**

```tsx
import type { AccountStatus, ProjectStatus } from '../../types'

const accountColors: Record<AccountStatus, string> = {
  ready: 'bg-green-500/20 text-green-400 border-green-500/30',
  limited: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  exhausted: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const projectColors: Record<ProjectStatus, string> = {
  active: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  paused: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  abandoned: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

interface Props {
  status: AccountStatus | ProjectStatus
  type: 'account' | 'project'
}

export function StatusBadge({ status, type }: Props) {
  const colors =
    type === 'account'
      ? accountColors[status as AccountStatus]
      : projectColors[status as ProjectStatus]
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${colors}`}>
      {status}
    </span>
  )
}
```

- [ ] **Step 2: Create `src/components/shared/PriorityBadge.tsx`**

```tsx
import type { Priority } from '../../types'

const colors: Record<Priority, string> = {
  urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  low: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${colors[priority]}`}>
      {priority}
    </span>
  )
}
```

- [ ] **Step 3: Create `src/components/shared/TagBadge.tsx`**

```tsx
interface Props {
  tag: string
  onRemove?: () => void
}

export function TagBadge({ tag, onRemove }: Props) {
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
      {tag}
      {onRemove && (
        <button type="button" onClick={onRemove} className="hover:text-red-400 transition-colors leading-none">
          ×
        </button>
      )}
    </span>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/shared/StatusBadge.tsx src/components/shared/PriorityBadge.tsx src/components/shared/TagBadge.tsx
git commit -m "feat: add StatusBadge, PriorityBadge, TagBadge components"
```

---

## Task 7: UsageBar + CountdownTimer + Modal

**Files:**
- Create: `src/components/shared/UsageBar.tsx`
- Create: `src/components/shared/CountdownTimer.tsx`
- Create: `src/components/shared/Modal.tsx`

- [ ] **Step 1: Create `src/components/shared/UsageBar.tsx`**

```tsx
interface Props {
  used: number
  total: number
  type: string
}

export function UsageBar({ used, total, type }: Props) {
  const pct = total > 0 ? Math.min((used / total) * 100, 100) : 0
  const barColor =
    pct >= 90 ? 'bg-red-500' : pct >= 60 ? 'bg-amber-500' : 'bg-green-500'

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-400">
        <span>
          {used} / {total} {type}
        </span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/shared/CountdownTimer.tsx`**

```tsx
import { useState, useEffect } from 'react'
import { getSecondsRemaining, formatCountdown, getCountdownColorClass } from '../../lib/countdown'

interface Props {
  resetAt: string | null
}

export function CountdownTimer({ resetAt }: Props) {
  const [seconds, setSeconds] = useState(() => getSecondsRemaining(resetAt))

  useEffect(() => {
    setSeconds(getSecondsRemaining(resetAt))
    if (!resetAt) return
    const id = setInterval(() => setSeconds(getSecondsRemaining(resetAt)), 1000)
    return () => clearInterval(id)
  }, [resetAt])

  const label = formatCountdown(seconds)
  const colorClass = getCountdownColorClass(seconds)

  return (
    <span className={`text-xs font-mono ${colorClass}`}>
      {label === 'Ready' ? '✓ Ready to use' : `Resets in ${label}`}
    </span>
  )
}
```

- [ ] **Step 3: Create `src/components/shared/Modal.tsx`**

```tsx
import { useEffect } from 'react'
import { X } from 'lucide-react'

interface Props {
  title: string
  onClose: () => void
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizeClass = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl' }

export function Modal({ title, onClose, children, size = 'md' }: Props) {
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizeClass[size]} bg-surface rounded-2xl border border-white/10 shadow-2xl max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <h2 className="font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/shared/UsageBar.tsx src/components/shared/CountdownTimer.tsx src/components/shared/Modal.tsx
git commit -m "feat: add UsageBar, CountdownTimer, Modal components"
```

---

## Task 8: Sidebar + App shell

**Files:**
- Create: `src/components/shared/Sidebar.tsx`
- Rewrite: `src/App.tsx`
- Create: `src/pages/Dashboard.tsx` (stub)
- Create: `src/pages/Accounts.tsx` (stub)
- Create: `src/pages/Projects.tsx` (stub)
- Create: `src/pages/Ideas.tsx` (stub)

- [ ] **Step 1: Create `src/components/shared/Sidebar.tsx`**

```tsx
import { LayoutDashboard, Bot, FolderKanban, Lightbulb } from 'lucide-react'
import type { Page } from '../../App'

interface Props {
  activePage: Page
  setActivePage: (page: Page) => void
}

const nav: { page: Page; label: string; Icon: React.ElementType; activeColor: string }[] = [
  { page: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard, activeColor: 'text-white' },
  { page: 'accounts', label: 'Accounts', Icon: Bot, activeColor: 'text-violet-400' },
  { page: 'projects', label: 'Projects', Icon: FolderKanban, activeColor: 'text-orange-400' },
  { page: 'ideas', label: 'Ideas', Icon: Lightbulb, activeColor: 'text-teal-400' },
]

export function Sidebar({ activePage, setActivePage }: Props) {
  return (
    <aside className="w-56 min-h-screen bg-surface border-r border-white/10 flex flex-col p-4 shrink-0">
      <div className="mb-8 px-1">
        <h1 className="text-lg font-bold text-white">AI Tracker</h1>
        <p className="text-xs text-gray-600 mt-0.5">Your AI command centre</p>
      </div>
      <nav className="flex flex-col gap-1">
        {nav.map(({ page, label, Icon, activeColor }) => {
          const active = activePage === page
          return (
            <button
              key={page}
              onClick={() => setActivePage(page)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left
                ${active ? `bg-white/10 ${activeColor}` : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'}`}
            >
              <Icon size={18} className={active ? activeColor : ''} />
              {label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
```

- [ ] **Step 2: Rewrite `src/App.tsx`**

```tsx
import { useState } from 'react'
import { Sidebar } from './components/shared/Sidebar'
import { Dashboard } from './pages/Dashboard'
import { Accounts } from './pages/Accounts'
import { Projects } from './pages/Projects'
import { Ideas } from './pages/Ideas'

export type Page = 'dashboard' | 'accounts' | 'projects' | 'ideas'

export default function App() {
  const [activePage, setActivePage] = useState<Page>('dashboard')

  const pages: Record<Page, React.ReactNode> = {
    dashboard: <Dashboard />,
    accounts: <Accounts />,
    projects: <Projects />,
    ideas: <Ideas />,
  }

  return (
    <div className="flex min-h-screen bg-bg text-white">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="flex-1 p-6 overflow-auto min-h-screen">
        {pages[activePage]}
      </main>
    </div>
  )
}
```

- [ ] **Step 3: Create stub pages**

`src/pages/Dashboard.tsx`:
```tsx
export function Dashboard() {
  return <div className="text-gray-400">Dashboard — coming soon</div>
}
```

`src/pages/Accounts.tsx`:
```tsx
export function Accounts() {
  return <div className="text-gray-400">Accounts — coming soon</div>
}
```

`src/pages/Projects.tsx`:
```tsx
export function Projects() {
  return <div className="text-gray-400">Projects — coming soon</div>
}
```

`src/pages/Ideas.tsx`:
```tsx
export function Ideas() {
  return <div className="text-gray-400">Ideas — coming soon</div>
}
```

- [ ] **Step 4: Delete `src/App.css`** (no longer needed)

```bash
rm src/App.css
```

- [ ] **Step 5: Start dev server and verify sidebar renders**

```bash
npm run dev
```
Open http://localhost:5173. Expected: dark background, left sidebar with 4 nav items, stub page content on the right.

- [ ] **Step 6: Commit**

```bash
git add src/components/shared/Sidebar.tsx src/App.tsx src/pages/
git commit -m "feat: add sidebar and App shell with stub pages"
```

---

## Task 9: Account components + Accounts page

**Files:**
- Create: `src/components/accounts/AccountCard.tsx`
- Create: `src/components/accounts/AccountList.tsx`
- Create: `src/components/accounts/AccountForm.tsx`
- Rewrite: `src/pages/Accounts.tsx`

- [ ] **Step 1: Create `src/components/accounts/AccountCard.tsx`**

```tsx
import { Bot, Pencil, Trash2 } from 'lucide-react'
import type { Account } from '../../types'
import { StatusBadge } from '../shared/StatusBadge'
import { CountdownTimer } from '../shared/CountdownTimer'
import { UsageBar } from '../shared/UsageBar'
import { TagBadge } from '../shared/TagBadge'

interface Props {
  account: Account
  onEdit: (account: Account) => void
  onDelete: (id: string) => void
}

export function AccountCard({ account, onEdit, onDelete }: Props) {
  return (
    <div className="bg-surface rounded-2xl border border-white/10 border-l-4 border-l-violet-500 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Bot size={16} className="text-violet-400 shrink-0" />
          <div className="min-w-0">
            <h3 className="font-semibold text-white text-sm truncate">{account.name}</h3>
            <p className="text-xs text-gray-500 truncate">
              {account.platform}
              {account.model ? ` · ${account.model}` : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <StatusBadge status={account.status} type="account" />
          <button
            onClick={() => onEdit(account)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(account.id)}
            className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <UsageBar used={account.limit_used} total={account.limit_total} type={account.limit_type} />
      <CountdownTimer resetAt={account.reset_at} />

      <div className="flex items-center gap-2 text-xs text-gray-600">
        {account.login_method === 'browser' && account.browser ? (
          <span>{account.browser}</span>
        ) : (
          <span>App</span>
        )}
        {account.device && <><span>·</span><span>{account.device}</span></>}
      </div>

      {account.category_tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {account.category_tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}

      {account.notes && (
        <p className="text-xs text-gray-500 line-clamp-2">{account.notes}</p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/accounts/AccountList.tsx`**

```tsx
import type { Account } from '../../types'
import { AccountCard } from './AccountCard'

interface Props {
  accounts: Account[]
  onEdit: (account: Account) => void
  onDelete: (id: string) => void
}

export function AccountList({ accounts, onEdit, onDelete }: Props) {
  if (accounts.length === 0) {
    return (
      <div className="text-center py-16 text-gray-600">
        <p className="text-lg mb-1">No accounts yet</p>
        <p className="text-sm">Add your first AI account to get started</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {accounts.map((account) => (
        <AccountCard key={account.id} account={account} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Create `src/components/accounts/AccountForm.tsx`**

```tsx
import { useState } from 'react'
import type { Account } from '../../types'
import { Modal } from '../shared/Modal'
import { TagBadge } from '../shared/TagBadge'
import { useAccountStore } from '../../store/accountStore'

type FormData = Omit<Account, 'id' | 'created_at' | 'updated_at'>

const defaultForm: FormData = {
  name: '',
  platform: '',
  model: '',
  login_method: 'browser',
  browser: '',
  device: '',
  limit_type: 'messages',
  limit_total: 10,
  limit_used: 0,
  reset_at: null,
  status: 'ready',
  category_tags: [],
  notes: '',
}

interface Props {
  account?: Account
  onClose: () => void
}

export function AccountForm({ account, onClose }: Props) {
  const { add, update } = useAccountStore()
  const [form, setForm] = useState<FormData>(() =>
    account
      ? {
          name: account.name,
          platform: account.platform,
          model: account.model,
          login_method: account.login_method,
          browser: account.browser,
          device: account.device,
          limit_type: account.limit_type,
          limit_total: account.limit_total,
          limit_used: account.limit_used,
          reset_at: account.reset_at,
          status: account.status,
          category_tags: account.category_tags,
          notes: account.notes,
        }
      : defaultForm,
  )
  const [tagInput, setTagInput] = useState('')
  const isEdit = Boolean(account)

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function addTag() {
    const tag = tagInput.trim()
    if (tag && !form.category_tags.includes(tag)) {
      setField('category_tags', [...form.category_tags, tag])
    }
    setTagInput('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEdit && account) {
      await update(account.id, form)
    } else {
      await add(form)
    }
    onClose()
  }

  return (
    <Modal title={isEdit ? 'Edit Account' : 'Add Account'} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Name *">
            <input className="input" value={form.name} onChange={(e) => setField('name', e.target.value)} required />
          </Field>
          <Field label="Platform *">
            <input className="input" value={form.platform} onChange={(e) => setField('platform', e.target.value)} placeholder="Claude, ChatGPT, Gemini…" required />
          </Field>
          <Field label="Model">
            <input className="input" value={form.model} onChange={(e) => setField('model', e.target.value)} placeholder="claude-sonnet-4-6, gpt-4o…" />
          </Field>
          <Field label="Login method">
            <select className="input" value={form.login_method} onChange={(e) => setField('login_method', e.target.value as 'app' | 'browser')}>
              <option value="browser">Browser</option>
              <option value="app">App</option>
            </select>
          </Field>
          {form.login_method === 'browser' && (
            <Field label="Browser">
              <input className="input" value={form.browser} onChange={(e) => setField('browser', e.target.value)} placeholder="Chrome, Firefox, Edge…" />
            </Field>
          )}
          <Field label="Device">
            <input className="input" value={form.device} onChange={(e) => setField('device', e.target.value)} placeholder="Desktop, Phone, Work Laptop…" />
          </Field>
          <Field label="Limit type">
            <input className="input" value={form.limit_type} onChange={(e) => setField('limit_type', e.target.value)} placeholder="messages, tokens…" />
          </Field>
          <Field label="Limit total">
            <input className="input" type="number" min={1} value={form.limit_total} onChange={(e) => setField('limit_total', Number(e.target.value))} />
          </Field>
          <Field label="Used so far">
            <input className="input" type="number" min={0} value={form.limit_used} onChange={(e) => setField('limit_used', Number(e.target.value))} />
          </Field>
          <Field label="Resets at">
            <input
              className="input"
              type="datetime-local"
              value={form.reset_at ? form.reset_at.slice(0, 16) : ''}
              onChange={(e) =>
                setField('reset_at', e.target.value ? new Date(e.target.value).toISOString() : null)
              }
            />
          </Field>
          <Field label="Status">
            <select className="input" value={form.status} onChange={(e) => setField('status', e.target.value as Account['status'])}>
              <option value="ready">Ready</option>
              <option value="limited">Limited</option>
              <option value="exhausted">Exhausted</option>
            </select>
          </Field>
        </div>

        <Field label="Category tags">
          <div className="flex gap-2">
            <input
              className="input flex-1"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addTag()
                }
              }}
              placeholder="coding, research… + Enter"
            />
            <button type="button" onClick={addTag} className="btn-secondary">
              Add
            </button>
          </div>
          {form.category_tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {form.category_tags.map((tag) => (
                <TagBadge
                  key={tag}
                  tag={tag}
                  onRemove={() => setField('category_tags', form.category_tags.filter((t) => t !== tag))}
                />
              ))}
            </div>
          )}
        </Field>

        <Field label="Notes">
          <textarea
            className="input min-h-[72px] resize-none"
            value={form.notes}
            onChange={(e) => setField('notes', e.target.value)}
          />
        </Field>

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary">{isEdit ? 'Save changes' : 'Add account'}</button>
        </div>
      </form>
    </Modal>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-500">{label}</label>
      {children}
    </div>
  )
}
```

- [ ] **Step 4: Rewrite `src/pages/Accounts.tsx`**

```tsx
import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useAccountStore } from '../store/accountStore'
import { AccountList } from '../components/accounts/AccountList'
import { AccountForm } from '../components/accounts/AccountForm'
import type { Account } from '../types'

export function Accounts() {
  const { accounts, loading, fetch, remove } = useAccountStore()
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<Account | null>(null)

  useEffect(() => { fetch() }, [])

  function handleEdit(account: Account) {
    setEditTarget(account)
    setShowForm(true)
  }

  function handleClose() {
    setShowForm(false)
    setEditTarget(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Accounts</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {accounts.length} account{accounts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={15} />
          Add account
        </button>
      </div>

      {loading ? (
        <p className="text-gray-600 text-sm">Loading…</p>
      ) : (
        <AccountList accounts={accounts} onEdit={handleEdit} onDelete={remove} />
      )}

      {showForm && <AccountForm account={editTarget ?? undefined} onClose={handleClose} />}
    </div>
  )
}
```

- [ ] **Step 5: Verify in browser**

Open http://localhost:5173, navigate to Accounts. Expected: empty state, "Add account" button opens modal with all fields, creates a card after save.

- [ ] **Step 6: Commit**

```bash
git add src/components/accounts/ src/pages/Accounts.tsx
git commit -m "feat: accounts list, card, and form"
```

---

## Task 10: ProjectCard + ProjectForm

**Files:**
- Create: `src/components/projects/ProjectCard.tsx`
- Create: `src/components/projects/ProjectForm.tsx`

- [ ] **Step 1: Create `src/components/projects/ProjectCard.tsx`**

```tsx
import { FolderKanban, Pencil, Trash2, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { Account, Project } from '../../types'
import { StatusBadge } from '../shared/StatusBadge'
import { PriorityBadge } from '../shared/PriorityBadge'
import { TagBadge } from '../shared/TagBadge'

interface Props {
  project: Project
  account: Account | undefined
  onClick: () => void
  onEdit: (project: Project) => void
  onDelete: (id: string) => void
}

export function ProjectCard({ project, account, onClick, onEdit, onDelete }: Props) {
  return (
    <div
      className="bg-surface rounded-2xl border border-white/10 border-l-4 border-l-orange-500 p-4 space-y-3 cursor-pointer hover:border-white/20 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <FolderKanban size={15} className="text-orange-400 shrink-0" />
          <div className="min-w-0">
            <h3 className="font-semibold text-white text-sm truncate">{project.name}</h3>
            {account && (
              <p className="text-xs text-gray-500 truncate">{account.name} · {account.platform}</p>
            )}
          </div>
        </div>
        <div
          className="flex items-center gap-1 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onEdit(project)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(project.id)}
            className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <StatusBadge status={project.status} type="project" />
        <PriorityBadge priority={project.priority} />
        {project.due_date && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-400">
            Due {new Date(project.due_date).toLocaleDateString()}
          </span>
        )}
      </div>

      {project.context_snapshot && (
        <p className="text-xs text-gray-500 line-clamp-2">{project.context_snapshot}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {project.domain_tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
        <div className="flex items-center gap-2">
          {project.conversation_url && (
            <a
              href={project.conversation_url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-violet-400 transition-colors"
            >
              <ExternalLink size={13} />
            </a>
          )}
          <span className="text-xs text-gray-600">
            {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/projects/ProjectForm.tsx`**

```tsx
import { useState } from 'react'
import type { Account, Project } from '../../types'
import { Modal } from '../shared/Modal'
import { TagBadge } from '../shared/TagBadge'
import { useProjectStore } from '../../store/projectStore'

type FormData = Omit<Project, 'id' | 'created_at' | 'updated_at'>

function makeDefault(accounts: Account[]): FormData {
  return {
    name: '',
    account_id: accounts[0]?.id ?? '',
    status: 'active',
    priority: 'medium',
    due_date: null,
    conversation_url: null,
    continued_from_project_id: null,
    context_snapshot: null,
    domain_tags: [],
  }
}

interface Props {
  project?: Project
  accounts: Account[]
  prefill?: { name?: string; context_snapshot?: string }
  onClose: () => void
  onCreated?: (project: Project) => void
}

export function ProjectForm({ project, accounts, prefill, onClose, onCreated }: Props) {
  const { add, update, projects } = useProjectStore()
  const [form, setForm] = useState<FormData>(() => {
    if (project) {
      return {
        name: project.name,
        account_id: project.account_id,
        status: project.status,
        priority: project.priority,
        due_date: project.due_date,
        conversation_url: project.conversation_url,
        continued_from_project_id: project.continued_from_project_id,
        context_snapshot: project.context_snapshot,
        domain_tags: project.domain_tags,
      }
    }
    const d = makeDefault(accounts)
    if (prefill?.name) d.name = prefill.name
    if (prefill?.context_snapshot) d.context_snapshot = prefill.context_snapshot
    return d
  })
  const [tagInput, setTagInput] = useState('')
  const isEdit = Boolean(project)

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function addTag() {
    const tag = tagInput.trim()
    if (tag && !form.domain_tags.includes(tag)) {
      setField('domain_tags', [...form.domain_tags, tag])
    }
    setTagInput('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEdit && project) {
      await update(project.id, form)
      onClose()
    } else {
      const created = await add(form)
      if (created && onCreated) onCreated(created)
      onClose()
    }
  }

  const otherProjects = projects.filter((p) => p.id !== project?.id)

  return (
    <Modal title={isEdit ? 'Edit Project' : 'New Project'} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Name *" className="col-span-2">
            <input className="input" value={form.name} onChange={(e) => setField('name', e.target.value)} required />
          </Field>

          <Field label="Account *">
            <select className="input" value={form.account_id} onChange={(e) => setField('account_id', e.target.value)} required>
              <option value="">Select account…</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Status">
            <select className="input" value={form.status} onChange={(e) => setField('status', e.target.value as Project['status'])}>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="abandoned">Abandoned</option>
            </select>
          </Field>

          <Field label="Priority">
            <select className="input" value={form.priority} onChange={(e) => setField('priority', e.target.value as Project['priority'])}>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </Field>

          <Field label="Due date">
            <input className="input" type="date" value={form.due_date ?? ''} onChange={(e) => setField('due_date', e.target.value || null)} />
          </Field>

          <Field label="Conversation URL" className="col-span-2">
            <input className="input" type="url" value={form.conversation_url ?? ''} onChange={(e) => setField('conversation_url', e.target.value || null)} placeholder="https://…" />
          </Field>

          <Field label="Continued from (cross-account link)" className="col-span-2">
            <select className="input" value={form.continued_from_project_id ?? ''} onChange={(e) => setField('continued_from_project_id', e.target.value || null)}>
              <option value="">None</option>
              {otherProjects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Context snapshot — where things left off">
          <textarea
            className="input min-h-[96px] resize-none"
            value={form.context_snapshot ?? ''}
            onChange={(e) => setField('context_snapshot', e.target.value || null)}
            placeholder="Summarise what was last discussed so you can resume easily…"
          />
        </Field>

        <Field label="Domain tags">
          <div className="flex gap-2">
            <input
              className="input flex-1"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
              placeholder="coding, research… + Enter"
            />
            <button type="button" onClick={addTag} className="btn-secondary">Add</button>
          </div>
          {form.domain_tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {form.domain_tags.map((tag) => (
                <TagBadge key={tag} tag={tag} onRemove={() => setField('domain_tags', form.domain_tags.filter((t) => t !== tag))} />
              ))}
            </div>
          )}
        </Field>

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary">{isEdit ? 'Save changes' : 'Create project'}</button>
        </div>
      </form>
    </Modal>
  )
}

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-xs font-medium text-gray-500">{label}</label>
      {children}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/projects/ProjectCard.tsx src/components/projects/ProjectForm.tsx
git commit -m "feat: add ProjectCard and ProjectForm"
```

---

## Task 11: TaskList + HistoryLog + ProjectDetail

**Files:**
- Create: `src/components/projects/TaskList.tsx`
- Create: `src/components/projects/HistoryLog.tsx`
- Create: `src/components/projects/ProjectDetail.tsx`

- [ ] **Step 1: Create `src/components/projects/TaskList.tsx`**

```tsx
import { useState } from 'react'
import { Plus, Trash2, CheckCircle2, Circle, Timer } from 'lucide-react'
import type { Task, TaskStatus } from '../../types'
import { useProjectStore } from '../../store/projectStore'

interface Props {
  projectId: string
  tasks: Task[]
}

const nextStatus: Record<TaskStatus, TaskStatus> = {
  todo: 'in_progress',
  in_progress: 'done',
  done: 'todo',
}

function StatusIcon({ status }: { status: TaskStatus }) {
  if (status === 'done') return <CheckCircle2 size={15} className="text-green-400" />
  if (status === 'in_progress') return <Timer size={15} className="text-amber-400" />
  return <Circle size={15} className="text-gray-600" />
}

export function TaskList({ projectId, tasks }: Props) {
  const { addTask, updateTask, removeTask } = useProjectStore()
  const [newTitle, setNewTitle] = useState('')

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    await addTask({
      project_id: projectId,
      title: newTitle.trim(),
      status: 'todo',
      due_date: null,
      sort_order: tasks.length,
    })
    setNewTitle('')
  }

  return (
    <div className="space-y-1.5">
      {tasks.map((task) => (
        <div key={task.id} className="flex items-center gap-2.5 group py-0.5">
          <button
            onClick={() => updateTask(task.id, { status: nextStatus[task.status] })}
            className="shrink-0 transition-opacity"
          >
            <StatusIcon status={task.status} />
          </button>
          <span
            className={`flex-1 text-sm ${
              task.status === 'done' ? 'line-through text-gray-600' : 'text-gray-200'
            }`}
          >
            {task.title}
          </span>
          <button
            onClick={() => removeTask(task.id, projectId)}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-gray-600 hover:text-red-400 transition-all"
          >
            <Trash2 size={11} />
          </button>
        </div>
      ))}

      <form onSubmit={handleAdd} className="flex items-center gap-2 pt-1">
        <input
          className="input flex-1 py-1.5 text-xs"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a task…"
        />
        <button
          type="submit"
          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-colors"
        >
          <Plus size={14} />
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/projects/HistoryLog.tsx`**

```tsx
import { formatDistanceToNow } from 'date-fns'
import type { ProjectHistory } from '../../types'

export function HistoryLog({ entries }: { entries: ProjectHistory[] }) {
  if (entries.length === 0) {
    return <p className="text-xs text-gray-600">No changes logged yet.</p>
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div key={entry.id} className="flex items-start gap-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-700 mt-1.5 shrink-0" />
          <div>
            <p className="text-xs text-gray-300">{entry.change_summary}</p>
            <p className="text-xs text-gray-600 mt-0.5">
              {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Create `src/components/projects/ProjectDetail.tsx`**

```tsx
import { useEffect } from 'react'
import { X, ExternalLink, Link2, Pencil } from 'lucide-react'
import { format } from 'date-fns'
import type { Project } from '../../types'
import { useProjectStore } from '../../store/projectStore'
import { useAccountStore } from '../../store/accountStore'
import { StatusBadge } from '../shared/StatusBadge'
import { PriorityBadge } from '../shared/PriorityBadge'
import { TagBadge } from '../shared/TagBadge'
import { TaskList } from './TaskList'
import { HistoryLog } from './HistoryLog'

interface Props {
  project: Project
  onClose: () => void
  onEdit: (project: Project) => void
}

export function ProjectDetail({ project, onClose, onEdit }: Props) {
  const { tasks, history, fetchTasks, fetchHistory, projects } = useProjectStore()
  const { accounts } = useAccountStore()
  const account = accounts.find((a) => a.id === project.account_id)
  const linkedFrom = project.continued_from_project_id
    ? projects.find((p) => p.id === project.continued_from_project_id)
    : null

  useEffect(() => {
    fetchTasks(project.id)
    fetchHistory(project.id)
  }, [project.id])

  const projectTasks = tasks[project.id] ?? []
  const projectHistory = history[project.id] ?? []

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-surface border-l border-white/10 h-full overflow-y-auto shadow-2xl">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-white truncate">{project.name}</h2>
              {account && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {account.name} · {account.platform}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button onClick={() => onEdit(project)} className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5">
                <Pencil size={12} />
                Edit
              </button>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={project.status} type="project" />
            <PriorityBadge priority={project.priority} />
            {project.due_date && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                Due {format(new Date(project.due_date), 'd MMM yyyy')}
              </span>
            )}
          </div>

          {/* Cross-account link */}
          {linkedFrom && (
            <div className="flex items-center gap-2 text-sm bg-white/5 rounded-xl px-3 py-2.5">
              <Link2 size={14} className="text-gray-500 shrink-0" />
              <span className="text-gray-400">
                Continued from{' '}
                <span className="text-white font-medium">{linkedFrom.name}</span>
              </span>
            </div>
          )}

          {/* Conversation URL */}
          {project.conversation_url && (
            <a
              href={project.conversation_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors"
            >
              <ExternalLink size={14} />
              Open conversation
            </a>
          )}

          {/* Context snapshot */}
          {project.context_snapshot && (
            <div>
              <p className="section-label mb-2">Context snapshot</p>
              <p className="text-sm text-gray-300 bg-white/5 rounded-xl px-4 py-3 whitespace-pre-wrap leading-relaxed">
                {project.context_snapshot}
              </p>
            </div>
          )}

          {/* Tags */}
          {project.domain_tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {project.domain_tags.map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
            </div>
          )}

          {/* Tasks */}
          <div>
            <p className="section-label mb-3">
              Tasks ({projectTasks.filter((t) => t.status !== 'done').length} open)
            </p>
            <TaskList projectId={project.id} tasks={projectTasks} />
          </div>

          {/* History */}
          <div>
            <p className="section-label mb-3">History</p>
            <HistoryLog entries={projectHistory} />
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/projects/TaskList.tsx src/components/projects/HistoryLog.tsx src/components/projects/ProjectDetail.tsx
git commit -m "feat: add TaskList, HistoryLog, ProjectDetail slide-over"
```

---

## Task 12: Projects page

**Files:**
- Rewrite: `src/pages/Projects.tsx`

- [ ] **Step 1: Rewrite `src/pages/Projects.tsx`**

```tsx
import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useProjectStore } from '../store/projectStore'
import { useAccountStore } from '../store/accountStore'
import { ProjectCard } from '../components/projects/ProjectCard'
import { ProjectForm } from '../components/projects/ProjectForm'
import { ProjectDetail } from '../components/projects/ProjectDetail'
import type { Project } from '../types'

const priorityOrder: Record<string, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
}

export function Projects() {
  const { projects, loading, fetch, remove } = useProjectStore()
  const { accounts, fetch: fetchAccounts } = useAccountStore()
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<Project | null>(null)
  const [detailTarget, setDetailTarget] = useState<Project | null>(null)

  useEffect(() => {
    fetch()
    fetchAccounts()
  }, [])

  const sorted = [...projects].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
  )

  function handleEdit(project: Project) {
    setDetailTarget(null)
    setEditTarget(project)
    setShowForm(true)
  }

  function handleClose() {
    setShowForm(false)
    setEditTarget(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={15} />
          New project
        </button>
      </div>

      {loading ? (
        <p className="text-gray-600 text-sm">Loading…</p>
      ) : sorted.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <p className="text-lg mb-1">No projects yet</p>
          <p className="text-sm">Create your first project to start tracking</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {sorted.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              account={accounts.find((a) => a.id === project.account_id)}
              onClick={() => setDetailTarget(project)}
              onEdit={handleEdit}
              onDelete={remove}
            />
          ))}
        </div>
      )}

      {showForm && (
        <ProjectForm
          project={editTarget ?? undefined}
          accounts={accounts}
          onClose={handleClose}
        />
      )}

      {detailTarget && (
        <ProjectDetail
          project={detailTarget}
          onClose={() => setDetailTarget(null)}
          onEdit={handleEdit}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

Navigate to Projects. Expected: empty state, "New project" opens form, saved project shows as a card sorted by priority. Clicking a card opens the slide-over detail panel. Edit and delete work.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Projects.tsx
git commit -m "feat: projects page with sort, detail slide-over"
```

---

## Task 13: Idea components + Ideas page

**Files:**
- Create: `src/components/ideas/IdeaCard.tsx`
- Create: `src/components/ideas/IdeaForm.tsx`
- Create: `src/components/ideas/IdeaList.tsx`
- Rewrite: `src/pages/Ideas.tsx`

- [ ] **Step 1: Create `src/components/ideas/IdeaCard.tsx`**

```tsx
import { Lightbulb, Pencil, Trash2, ArrowUpRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { Idea, Project } from '../../types'
import { TagBadge } from '../shared/TagBadge'

interface Props {
  idea: Idea
  linkedProject: Project | undefined
  onEdit: (idea: Idea) => void
  onDelete: (id: string) => void
  onPromote: (idea: Idea) => void
}

export function IdeaCard({ idea, linkedProject, onEdit, onDelete, onPromote }: Props) {
  return (
    <div className="bg-surface rounded-2xl border border-white/10 border-l-4 border-l-teal-500 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Lightbulb size={15} className="text-teal-400 shrink-0" />
          <h3 className="font-semibold text-white text-sm truncate">{idea.title}</h3>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onPromote(idea)}
            title="Promote to project"
            className="p-1.5 rounded-lg hover:bg-teal-500/20 text-gray-500 hover:text-teal-400 transition-colors"
          >
            <ArrowUpRight size={13} />
          </button>
          <button
            onClick={() => onEdit(idea)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(idea.id)}
            className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {idea.body && <p className="text-xs text-gray-400 line-clamp-3">{idea.body}</p>}

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {idea.tags.map((tag) => <TagBadge key={tag} tag={tag} />)}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          {linkedProject && (
            <span className="text-teal-700">→ {linkedProject.name}</span>
          )}
          <span>{formatDistanceToNow(new Date(idea.created_at), { addSuffix: true })}</span>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/ideas/IdeaForm.tsx`**

```tsx
import { useState } from 'react'
import type { Idea, Project } from '../../types'
import { Modal } from '../shared/Modal'
import { TagBadge } from '../shared/TagBadge'
import { useIdeaStore } from '../../store/ideaStore'

type FormData = Omit<Idea, 'id' | 'created_at' | 'updated_at'>

interface Props {
  idea?: Idea
  projects: Project[]
  prefill?: { title?: string; body?: string }
  onClose: () => void
}

export function IdeaForm({ idea, projects, prefill, onClose }: Props) {
  const { add, update } = useIdeaStore()
  const [form, setForm] = useState<FormData>(() => ({
    title: idea?.title ?? prefill?.title ?? '',
    body: idea?.body ?? prefill?.body ?? null,
    project_id: idea?.project_id ?? null,
    tags: idea?.tags ?? [],
  }))
  const [tagInput, setTagInput] = useState('')
  const isEdit = Boolean(idea)

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function addTag() {
    const tag = tagInput.trim()
    if (tag && !form.tags.includes(tag)) setField('tags', [...form.tags, tag])
    setTagInput('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEdit && idea) {
      await update(idea.id, form)
    } else {
      await add(form)
    }
    onClose()
  }

  return (
    <Modal title={isEdit ? 'Edit Idea' : 'New Idea'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500">Title *</label>
          <input className="input" value={form.title} onChange={(e) => setField('title', e.target.value)} required autoFocus />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500">Details</label>
          <textarea
            className="input min-h-[80px] resize-none"
            value={form.body ?? ''}
            onChange={(e) => setField('body', e.target.value || null)}
            placeholder="Any extra context…"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500">Link to project (optional)</label>
          <select className="input" value={form.project_id ?? ''} onChange={(e) => setField('project_id', e.target.value || null)}>
            <option value="">Global (no project)</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500">Tags</label>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
              placeholder="Add tag + Enter"
            />
            <button type="button" onClick={addTag} className="btn-secondary">Add</button>
          </div>
          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {form.tags.map((tag) => (
                <TagBadge key={tag} tag={tag} onRemove={() => setField('tags', form.tags.filter((t) => t !== tag))} />
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary">{isEdit ? 'Save' : 'Add idea'}</button>
        </div>
      </form>
    </Modal>
  )
}
```

- [ ] **Step 3: Create `src/components/ideas/IdeaList.tsx`**

```tsx
import type { Idea, Project } from '../../types'
import { IdeaCard } from './IdeaCard'

interface Props {
  ideas: Idea[]
  projects: Project[]
  onEdit: (idea: Idea) => void
  onDelete: (id: string) => void
  onPromote: (idea: Idea) => void
}

export function IdeaList({ ideas, projects, onEdit, onDelete, onPromote }: Props) {
  if (ideas.length === 0) {
    return (
      <div className="text-center py-16 text-gray-600">
        <p className="text-lg mb-1">No ideas yet</p>
        <p className="text-sm">Capture your first idea before it disappears</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {ideas.map((idea) => (
        <IdeaCard
          key={idea.id}
          idea={idea}
          linkedProject={projects.find((p) => p.id === idea.project_id)}
          onEdit={onEdit}
          onDelete={onDelete}
          onPromote={onPromote}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Rewrite `src/pages/Ideas.tsx`**

```tsx
import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useIdeaStore } from '../store/ideaStore'
import { useProjectStore } from '../store/projectStore'
import { IdeaList } from '../components/ideas/IdeaList'
import { IdeaForm } from '../components/ideas/IdeaForm'
import { ProjectForm } from '../components/projects/ProjectForm'
import { useAccountStore } from '../store/accountStore'
import type { Idea, Project } from '../types'

export function Ideas() {
  const { ideas, loading, fetch, remove } = useIdeaStore()
  const { projects, fetch: fetchProjects, update: updateIdea } = useProjectStore()
  const { accounts, fetch: fetchAccounts } = useAccountStore()
  const { update: updateIdeaStore } = useIdeaStore()
  const [showIdeaForm, setShowIdeaForm] = useState(false)
  const [editIdea, setEditIdea] = useState<Idea | null>(null)
  const [promoteIdea, setPromoteIdea] = useState<Idea | null>(null)

  useEffect(() => {
    fetch()
    fetchProjects()
    fetchAccounts()
  }, [])

  function handlePromote(idea: Idea) {
    setPromoteIdea(idea)
  }

  async function handleProjectCreated(project: Project) {
    if (promoteIdea) {
      await updateIdeaStore(promoteIdea.id, { project_id: project.id })
    }
    setPromoteIdea(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ideas</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {ideas.length} idea{ideas.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => setShowIdeaForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={15} />
          New idea
        </button>
      </div>

      {loading ? (
        <p className="text-gray-600 text-sm">Loading…</p>
      ) : (
        <IdeaList
          ideas={ideas}
          projects={projects}
          onEdit={(idea) => { setEditIdea(idea); setShowIdeaForm(true) }}
          onDelete={remove}
          onPromote={handlePromote}
        />
      )}

      {showIdeaForm && (
        <IdeaForm
          idea={editIdea ?? undefined}
          projects={projects}
          onClose={() => { setShowIdeaForm(false); setEditIdea(null) }}
        />
      )}

      {promoteIdea && (
        <ProjectForm
          accounts={accounts}
          prefill={{ name: promoteIdea.title, context_snapshot: promoteIdea.body ?? undefined }}
          onClose={() => setPromoteIdea(null)}
          onCreated={handleProjectCreated}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/ideas/ src/pages/Ideas.tsx
git commit -m "feat: ideas list, card, form, and promote-to-project"
```

---

## Task 14: Dashboard

**Files:**
- Create: `src/components/dashboard/StatsBar.tsx`
- Create: `src/components/dashboard/AccountSummary.tsx`
- Create: `src/components/dashboard/ActiveProjects.tsx`
- Rewrite: `src/pages/Dashboard.tsx`

- [ ] **Step 1: Create `src/components/dashboard/StatsBar.tsx`**

```tsx
import { Bot, FolderKanban, CheckSquare, Lightbulb } from 'lucide-react'

interface Props {
  readyAccounts: number
  activeProjects: number
  openTasks: number
  totalIdeas: number
}

export function StatsBar({ readyAccounts, activeProjects, openTasks, totalIdeas }: Props) {
  const stats = [
    { label: 'Accounts ready', value: readyAccounts, Icon: Bot, color: 'text-violet-400' },
    { label: 'Active projects', value: activeProjects, Icon: FolderKanban, color: 'text-orange-400' },
    { label: 'Open tasks', value: openTasks, Icon: CheckSquare, color: 'text-amber-400' },
    { label: 'Ideas', value: totalIdeas, Icon: Lightbulb, color: 'text-teal-400' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map(({ label, value, Icon, color }) => (
        <div key={label} className="card flex items-center gap-3">
          <Icon size={20} className={color} />
          <div>
            <p className="text-2xl font-bold text-white leading-none">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/dashboard/AccountSummary.tsx`**

```tsx
import type { Account } from '../../types'
import { StatusBadge } from '../shared/StatusBadge'
import { CountdownTimer } from '../shared/CountdownTimer'
import { UsageBar } from '../shared/UsageBar'

export function AccountSummary({ accounts }: { accounts: Account[] }) {
  if (accounts.length === 0) return null

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-400 mb-3">Accounts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {accounts.map((account) => (
          <div key={account.id} className="card space-y-2 border-l-4 border-l-violet-500">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{account.name}</p>
                <p className="text-xs text-gray-500 truncate">{account.platform}</p>
              </div>
              <StatusBadge status={account.status} type="account" />
            </div>
            <UsageBar used={account.limit_used} total={account.limit_total} type={account.limit_type} />
            <CountdownTimer resetAt={account.reset_at} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create `src/components/dashboard/ActiveProjects.tsx`**

```tsx
import type { Account, Project } from '../../types'
import { StatusBadge } from '../shared/StatusBadge'
import { PriorityBadge } from '../shared/PriorityBadge'

interface Props {
  projects: Project[]
  accounts: Account[]
}

export function ActiveProjects({ projects, accounts }: Props) {
  if (projects.length === 0) return null

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-400 mb-3">Active projects</h2>
      <div className="space-y-2">
        {projects.map((project) => {
          const account = accounts.find((a) => a.id === project.account_id)
          return (
            <div key={project.id} className="card flex items-center gap-3 border-l-4 border-l-orange-500">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{project.name}</p>
                {account && <p className="text-xs text-gray-500 truncate">{account.name}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <PriorityBadge priority={project.priority} />
                <StatusBadge status={project.status} type="project" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Rewrite `src/pages/Dashboard.tsx`**

```tsx
import { useEffect } from 'react'
import { useAccountStore } from '../store/accountStore'
import { useProjectStore } from '../store/projectStore'
import { useIdeaStore } from '../store/ideaStore'
import { StatsBar } from '../components/dashboard/StatsBar'
import { AccountSummary } from '../components/dashboard/AccountSummary'
import { ActiveProjects } from '../components/dashboard/ActiveProjects'

const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 }

export function Dashboard() {
  const { accounts, fetch: fetchAccounts } = useAccountStore()
  const { projects, openTaskCount, fetch: fetchProjects, fetchOpenTaskCount } = useProjectStore()
  const { ideas, fetch: fetchIdeas } = useIdeaStore()

  useEffect(() => {
    fetchAccounts()
    fetchProjects()
    fetchIdeas()
    fetchOpenTaskCount()
  }, [])

  const activeProjects = [...projects]
    .filter((p) => p.status === 'active')
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your AI command centre</p>
      </div>

      <StatsBar
        readyAccounts={accounts.filter((a) => a.status === 'ready').length}
        activeProjects={activeProjects.length}
        openTasks={openTaskCount}
        totalIdeas={ideas.length}
      />

      <AccountSummary accounts={accounts} />
      <ActiveProjects projects={activeProjects} accounts={accounts} />
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/ src/pages/Dashboard.tsx
git commit -m "feat: dashboard with stats, account summary, active projects"
```

---

## Task 15: QuickCapture FAB

**Files:**
- Create: `src/components/shared/QuickCapture.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create `src/components/shared/QuickCapture.tsx`**

```tsx
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Modal } from './Modal'
import { useAccountStore } from '../../store/accountStore'
import { useProjectStore } from '../../store/projectStore'
import { useIdeaStore } from '../../store/ideaStore'

type CaptureType = 'idea' | 'project'

export function QuickCapture() {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<CaptureType>('idea')
  const [title, setTitle] = useState('')
  const [accountId, setAccountId] = useState('')
  const { accounts } = useAccountStore()
  const { add: addProject } = useProjectStore()
  const { add: addIdea } = useIdeaStore()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    if (type === 'idea') {
      await addIdea({ title: title.trim(), body: null, project_id: null, tags: [] })
    } else {
      await addProject({
        name: title.trim(),
        account_id: accountId,
        status: 'active',
        priority: 'medium',
        due_date: null,
        conversation_url: null,
        continued_from_project_id: null,
        context_snapshot: null,
        domain_tags: [],
      })
    }

    setTitle('')
    setAccountId('')
    setOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-teal-600 text-white shadow-xl hover:scale-110 active:scale-95 transition-transform flex items-center justify-center z-30"
        title="Quick capture"
      >
        <Plus size={22} />
      </button>

      {open && (
        <Modal title="Quick capture" onClose={() => setOpen(false)} size="sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              {(['idea', 'project'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${
                    type === t ? 'bg-violet-600 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === 'idea' ? 'What's the idea?' : 'Project name?'}
              autoFocus
              required
            />

            {type === 'project' && (
              <select
                className="input"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                required
              >
                <option value="">Select account…</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            )}

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Capture</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}
```

- [ ] **Step 2: Add QuickCapture to `src/App.tsx`**

```tsx
import { useState } from 'react'
import { Sidebar } from './components/shared/Sidebar'
import { QuickCapture } from './components/shared/QuickCapture'
import { Dashboard } from './pages/Dashboard'
import { Accounts } from './pages/Accounts'
import { Projects } from './pages/Projects'
import { Ideas } from './pages/Ideas'

export type Page = 'dashboard' | 'accounts' | 'projects' | 'ideas'

export default function App() {
  const [activePage, setActivePage] = useState<Page>('dashboard')

  const pages: Record<Page, React.ReactNode> = {
    dashboard: <Dashboard />,
    accounts: <Accounts />,
    projects: <Projects />,
    ideas: <Ideas />,
  }

  return (
    <div className="flex min-h-screen bg-bg text-white">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="flex-1 p-6 overflow-auto min-h-screen">
        {pages[activePage]}
      </main>
      <QuickCapture />
    </div>
  )
}
```

- [ ] **Step 3: Full smoke test**

```bash
npm run dev
```

Walk through every feature:
1. Add an account → verify card shows usage bar and countdown
2. Add a project linked to that account → verify it appears on Dashboard
3. Open project detail → add tasks, toggle statuses, verify history auto-logs
4. Add an idea → promote it to a project
5. Use QuickCapture FAB for a new idea and a new project
6. Check Dashboard stats update accordingly

- [ ] **Step 4: Run all tests**

```bash
npx vitest run
```
Expected: 11 tests pass, 0 failures.

- [ ] **Step 5: Commit**

```bash
git add src/components/shared/QuickCapture.tsx src/App.tsx
git commit -m "feat: QuickCapture FAB — complete app"
```

---

## Self-Review Checklist

- [x] **Spec coverage** — all 5 tables implemented, all 4 pages built, live countdown timer, usage bar, cross-account linking, status history auto-log, promote-to-project, QuickCapture FAB
- [x] **No placeholders** — every step has complete code
- [x] **Type consistency** — `Project`, `Account`, `Task`, `Idea`, `ProjectHistory` defined in Task 3 and used consistently throughout; `TaskInput`, `ProjectInput`, `AccountInput`, `IdeaInput` strip `id`/`created_at`/`updated_at` consistently
- [x] **Countdown utility tested** — 11 unit tests in Task 4
- [x] **History auto-log** — handled in `projectStore.update()` in Task 5
- [x] **Promote-to-project** — IdeaForm `onCreated` callback links idea to new project in Task 13
