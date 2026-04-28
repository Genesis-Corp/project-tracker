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
    try {
      const { data } = await supabase.from('ideas').select('*').order('created_at', { ascending: false })
      set({ ideas: data ?? [] })
    } finally {
      set({ loading: false })
    }
  },

  add: async (data) => {
    const { data: row, error } = await supabase.from('ideas').insert(data).select().single()
    if (error) throw error
    if (row) set((s) => ({ ideas: [row, ...s.ideas] }))
    return row ?? null
  },

  update: async (id, updates) => {
    const { data: row, error } = await supabase
      .from('ideas')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    if (row) set((s) => ({ ideas: s.ideas.map((i) => (i.id === id ? row : i)) }))
  },

  remove: async (id) => {
    const { error } = await supabase.from('ideas').delete().eq('id', id)
    if (error) throw error
    set((s) => ({ ideas: s.ideas.filter((i) => i.id !== id) }))
  },
}))
