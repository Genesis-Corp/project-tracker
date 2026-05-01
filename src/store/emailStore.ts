import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { EmailIdentity } from '../types'

type EmailInput = Omit<EmailIdentity, 'id' | 'created_at' | 'updated_at'>

interface EmailStore {
  emails: EmailIdentity[]
  loading: boolean
  fetch: () => Promise<void>
  add: (data: EmailInput) => Promise<EmailIdentity | null>
  update: (id: string, updates: Partial<EmailInput>) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useEmailStore = create<EmailStore>((set) => ({
  emails: [],
  loading: false,

  fetch: async () => {
    set({ loading: true })
    try {
      const { data } = await supabase
        .from('email_identities')
        .select('*')
        .order('created_at', { ascending: false })
      set({ emails: data ?? [] })
    } finally {
      set({ loading: false })
    }
  },

  add: async (data) => {
    const { data: row, error } = await supabase
      .from('email_identities')
      .insert(data)
      .select()
      .single()
    if (error) throw error
    if (row) set((s) => ({ emails: [row, ...s.emails] }))
    return row ?? null
  },

  update: async (id, updates) => {
    const { data: row, error } = await supabase
      .from('email_identities')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    if (row) set((s) => ({ emails: s.emails.map((e) => (e.id === id ? row : e)) }))
  },

  remove: async (id) => {
    const { error } = await supabase.from('email_identities').delete().eq('id', id)
    if (error) throw error
    set((s) => ({ emails: s.emails.filter((e) => e.id !== id) }))
  },
}))
