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
