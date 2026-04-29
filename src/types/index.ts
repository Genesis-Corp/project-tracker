export type AccountStatus = 'ready' | 'limited' | 'exhausted'
export type ProjectStatus = 'active' | 'paused' | 'completed' | 'abandoned'
export type Priority = 'urgent' | 'high' | 'medium' | 'low'
export type TaskStatus = 'todo' | 'in_progress' | 'done'

export interface Account {
  id: string
  name: string
  platform: string
  subscription: string
  login_method: 'app' | 'browser' | 'terminal'
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
  model: string
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
  completed_at: string | null
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
