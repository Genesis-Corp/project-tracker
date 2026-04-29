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
      const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
      set({ projects: data ?? [] })
    } finally {
      set({ loading: false })
    }
  },

  add: async (data) => {
    const { data: row, error } = await supabase.from('projects').insert(data).select().single()
    if (error) throw error
    if (row) set((s) => ({ projects: [row, ...s.projects] }))
    return row ?? null
  },

  update: async (id, updates) => {
    const current = get().projects.find((p) => p.id === id)
    const { data: row, error } = await supabase
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error

    if (row) {
      const historyEntries: string[] = []
      if (current?.status !== updates.status && updates.status) {
        historyEntries.push(`Status changed to ${updates.status}`)
      }
      if (current?.priority !== updates.priority && updates.priority) {
        historyEntries.push(`Priority changed to ${updates.priority}`)
      }
      for (const summary of historyEntries) {
        const { error: histError } = await supabase.from('project_history').insert({ project_id: id, change_summary: summary })
        if (histError) console.error('Failed to log project history:', histError)
      }
      // Only refresh history cache if it was already loaded; fetchHistory will hydrate it fresh when the detail panel opens
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
    const { data: row, error } = await supabase.from('tasks').update(updates).eq('id', id).select().single()
    if (error) throw error
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
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .in('status', ['todo', 'in_progress'])
      .order('sort_order')
    if (data) {
      const grouped: Record<string, Task[]> = {}
      for (const task of data) {
        if (!grouped[task.project_id]) grouped[task.project_id] = []
        grouped[task.project_id].push(task)
      }
      set((s) => ({ tasks: { ...s.tasks, ...grouped } }))
    }
  },
}))
