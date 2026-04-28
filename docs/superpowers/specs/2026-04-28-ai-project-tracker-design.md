# AI Project Tracker — Design Spec
**Date:** 2026-04-28
**Status:** Approved

---

## Overview

A personal dashboard for managing multiple AI accounts, the projects running inside them, related tasks, and a global ideas scratchpad. Solves the problem of projects being forgotten, limits not being tracked, and ideas having nowhere to live while waiting for a rate limit to reset.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Vite + React 19 + TypeScript |
| Backend / DB | Supabase (PostgreSQL) |
| State | Zustand |
| Styling | Tailwind CSS |
| Icons | lucide-react |
| Dates | date-fns |
| Routing | React state (`activePage`) — no router needed |

Single-user personal tool. No auth layer required. Supabase used for persistence and cross-device sync.

---

## Data Model

### `accounts`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| name | text | e.g. "Claude Pro #2" |
| platform | text | e.g. "Claude", "ChatGPT", "Gemini", "Grok" |
| model | text | e.g. "claude-sonnet-4-6", "gpt-4o" |
| login_method | text | 'app' or 'browser' |
| browser | text | e.g. "Chrome", "Firefox", "Edge" |
| device | text | e.g. "Desktop", "Phone", "Work Laptop" |
| limit_type | text | e.g. "messages", "tokens", "projects" |
| limit_total | integer | e.g. 10 |
| limit_used | integer | e.g. 7 |
| reset_at | timestamptz | When the limit resets (drives live countdown) |
| status | text | 'ready' / 'limited' / 'exhausted' |
| category_tags | text[] | e.g. ["coding", "research"] |
| notes | text | Free-text notes |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

### `projects`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text | |
| account_id | uuid FK | → accounts.id |
| status | text | 'active' / 'paused' / 'completed' / 'abandoned' |
| priority | text | 'urgent' / 'high' / 'medium' / 'low' |
| due_date | date | Optional |
| conversation_url | text | Direct link to the chat thread |
| continued_from_project_id | uuid FK | Self-ref → projects.id (cross-account linking) |
| context_snapshot | text | Free-text: where the conversation left off |
| domain_tags | text[] | e.g. ["coding", "writing"] |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `tasks`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| project_id | uuid FK | → projects.id |
| title | text | |
| status | text | 'todo' / 'in_progress' / 'done' |
| due_date | date | Optional |
| sort_order | integer | For manual reordering |
| created_at | timestamptz | |

### `project_history`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| project_id | uuid FK | → projects.id |
| change_summary | text | e.g. "moved to In Progress" |
| created_at | timestamptz | |

Auto-logged whenever a project's status or priority changes. Read-only — never edited.

### `ideas`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| title | text | |
| body | text | Optional longer description |
| project_id | uuid FK | → projects.id — NULL means global |
| tags | text[] | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

Ideas are global by default (`project_id = null`). Can be linked to a project, or promoted to a full project via a "Promote to Project" action.

---

## Component Structure

```
src/
  components/
    accounts/
      AccountCard.tsx       — card: usage bar + live countdown + status badge
      AccountForm.tsx       — create/edit modal
      AccountList.tsx       — responsive grid
    projects/
      ProjectCard.tsx       — summary card with priority badge + account tag
      ProjectForm.tsx       — create/edit modal
      ProjectDetail.tsx     — slide-over panel: tasks, history log, context snapshot
      TaskList.tsx          — inline checklist within a project
      HistoryLog.tsx        — auto-logged status changes list
    ideas/
      IdeaCard.tsx
      IdeaForm.tsx
      IdeaList.tsx          — global view + filtered by project
    dashboard/
      StatsBar.tsx          — counts: accounts ready / active projects / open tasks
      AccountSummary.tsx    — mini account cards with timers
      ActiveProjects.tsx    — priority-sorted project list
    shared/
      CountdownTimer.tsx    — useEffect interval, colour-shifts near reset
      UsageBar.tsx          — visual X/Y usage bar
      TagBadge.tsx
      StatusBadge.tsx
      Modal.tsx
      QuickCapture.tsx      — floating FAB, dumps idea or project in <5s
      Sidebar.tsx           — left nav
  pages/
    Dashboard.tsx
    Accounts.tsx
    Projects.tsx
    Ideas.tsx
  store/
    accountStore.ts
    projectStore.ts
    ideaStore.ts
  lib/
    supabase.ts
  types/
    index.ts
```

**Routing:** Simple `activePage` state in `App.tsx` — no React Router. Four views: Dashboard, Accounts, Projects, Ideas. Project detail opens as a slide-over panel (preserves list context).

---

## Key Feature Details

### Live Countdown Timer
- `CountdownTimer` component uses `useEffect` + `setInterval` (1s tick)
- Computes `reset_at - now()` on each tick
- Display format: `Xh Ym Zs` remaining
- Color transitions: white → amber (< 2 hrs) → red + pulse (< 15 min) → green "Ready" when elapsed

### Usage Bar
- Thin horizontal bar under account name
- Fills red as `limit_used / limit_total` increases
- Shows label: `7 / 10 messages`

### QuickCapture FAB
- Always-visible floating button (bottom-right)
- Opens compact modal: title + type (Project or Idea) + optional account/project link
- Submits in under 5 seconds without navigating away

### Cross-Account Linking
- `continued_from_project_id` on a project points to the source project (possibly on a different account)
- ProjectDetail shows a "Continued from: [Project Name] on [Account]" link

### Status History Log
- Auto-written to `project_history` on every status/priority change
- Displayed as a simple chronological list in ProjectDetail
- Not user-editable

### Promote Idea to Project
- Button on IdeaCard: "Promote to Project"
- Pre-fills ProjectForm with idea title/body
- On save, idea is soft-linked to the new project

---

## Visual Design

### Color System
| Token | Value |
|---|---|
| Background | `#0f0f13` |
| Surface (cards) | `#1a1a24` |
| Accounts accent | Purple `#8b5cf6` |
| Projects accent | Coral `#f97316` |
| Ideas accent | Teal `#14b8a6` |
| Tasks accent | Amber `#f59e0b` |
| Status: Ready | Green `#22c55e` |
| Status: Limited | Amber `#f59e0b` |
| Status: Exhausted | Red `#ef4444` |

### Priority Pills
- Urgent → red, High → orange, Medium → blue, Low → grey

### Cards
- `rounded-2xl`, coloured left-border per entity type, dark surface background

### Sidebar
- Narrow left nav, active item highlighted in entity-matching color, collapsible on small screens

### QuickCapture FAB
- Purple-to-teal gradient, `+` icon, bottom-right fixed position

---

## Out of Scope (v1)
- Multi-user / auth
- Real-time Supabase subscriptions (can add later)
- Mobile app
- Notifications / reminders
- Import/export
