import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Project, Task, ProjectHistory, ProjectStatus, Priority } from '../types'

type ProjectInput = Omit<Project, 'id' | 'created_at' | 'updated_at'>
type TaskInput = Omit<Task, 'id' | 'created_at'>

// Raw row shape returned by Supabase before we map account_ids
type RawProjectRow = Omit<Project, 'account_ids'> & {
  project_accounts: { account_id: string }[] | null
}

function toProject(raw: RawProjectRow): Project {
  const { project_accounts, ...rest } = raw
  return { ...rest, account_ids: (project_accounts ?? []).map((pa) => pa.account_id) }
}

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
  fetchAllOpenTasks: () => Promise<void>
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  tasks: {},
  history: {},
  openTaskCount: 0,
  loading: false,

  fetch: async () => {
    set({ loading: true })
    try {
      const { data } = await supabase
        .from('projects')
        .select('*, project_accounts(account_id)')
        .order('created_at', { ascending: false })
      set({ projects: (data ?? []).map((row) => toProject(row as RawProjectRow)) })
    } finally {
      set({ loading: false })
    }
  },

  add: async (data) => {
    const { account_ids, ...projectFields } = data
    const { data: row, error } = await supabase
      .from('projects')
      .insert(projectFields)
      .select()
      .single()
    if (error) throw error
    if (!row) return null

    if (account_ids.length > 0) {
      await supabase.from('project_accounts').insert(
        account_ids.map((aid) => ({ project_id: row.id, account_id: aid }))
      )
    }

    const project: Project = { ...row, account_ids }
    set((s) => ({ projects: [project, ...s.projects] }))
    return project
  },

  update: async (id, updates) => {
    const { account_ids, ...projectFields } = updates
    const current = get().projects.find((p) => p.id === id)

    const { data: row, error } = await supabase
      .from('projects')
      .update({ ...projectFields, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error

    // History entries for status/priority changes
    if (row) {
      const historyEntries: string[] = []
      if (current?.status !== (updates as { status?: ProjectStatus }).status && (updates as { status?: ProjectStatus }).status) {
        historyEntries.push(`Status changed to ${(updates as { status?: ProjectStatus }).status}`)
      }
      if (current?.priority !== (updates as { priority?: Priority }).priority && (updates as { priority?: Priority }).priority) {
        historyEntries.push(`Priority changed to ${(updates as { priority?: Priority }).priority}`)
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
    }

    // Update junction table when account_ids changed
    let newAccountIds = current?.account_ids ?? []
    if (account_ids !== undefined) {
      await supabase.from('project_accounts').delete().eq('project_id', id)
      if (account_ids.length > 0) {
        await supabase.from('project_accounts').insert(
          account_ids.map((aid) => ({ project_id: id, account_id: aid }))
        )
      }
      newAccountIds = account_ids
    }

    if (row) {
      set((s) => ({
        projects: s.projects.map((p) =>
          p.id === id ? { ...row, account_ids: newAccountIds } : p
        ),
      }))
    }
  },

  remove: async (id) => {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) throw error
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
    const { data: row, error } = await supabase.from('tasks').insert(task).select().single()
    if (error) throw error
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
    const task = Object.values(get().tasks).flat().find((t) => t.id === id)
    const payload = updates.status === 'done'
      ? { ...updates, completed_at: new Date().toISOString() }
      : updates
    const { data: row, error } = await supabase.from('tasks').update(payload).eq('id', id).select().single()
    if (error) throw error
    if (row) {
      if (updates.status === 'done' && task) {
        await supabase.from('project_history').insert({
          project_id: task.project_id,
          change_summary: `Task completed: "${task.title}"`,
        })
        if (get().history[task.project_id]) {
          const { data: hist } = await supabase
            .from('project_history')
            .select('*')
            .eq('project_id', task.project_id)
            .order('created_at', { ascending: false })
          if (hist) set((s) => ({ history: { ...s.history, [task.project_id]: hist } }))
        }
      }
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
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) throw error
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

  fetchAllOpenTasks: async () => {
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
    const [openResult, recentDoneResult] = await Promise.all([
      supabase.from('tasks').select('*').in('status', ['todo', 'in_progress']).order('sort_order'),
      supabase.from('tasks').select('*').eq('status', 'done').gte('completed_at', cutoff).order('sort_order'),
    ])
    const all = [...(openResult.data ?? []), ...(recentDoneResult.data ?? [])]
    const grouped: Record<string, Task[]> = {}
    for (const task of all) {
      if (!grouped[task.project_id]) grouped[task.project_id] = []
      grouped[task.project_id].push(task)
    }
    set((s) => ({ tasks: { ...s.tasks, ...grouped } }))
  },
}))
