import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Account } from '../types'

type AccountInput = Omit<Account, 'id' | 'created_at' | 'updated_at'>

interface AccountStore {
  accounts: Account[]
  loading: boolean
  fetch: () => Promise<void>
  add: (data: AccountInput) => Promise<Account | null>
  update: (id: string, updates: Partial<AccountInput>) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useAccountStore = create<AccountStore>((set) => ({
  accounts: [],
  loading: false,

  fetch: async () => {
    set({ loading: true })
    try {
      const { data } = await supabase.from('accounts').select('*').order('created_at', { ascending: false })
      set({ accounts: data ?? [] })
    } finally {
      set({ loading: false })
    }
  },

  add: async (data) => {
    const { data: row, error } = await supabase.from('accounts').insert(data).select().single()
    if (error) throw error
    if (row) set((s) => ({ accounts: [row, ...s.accounts] }))
    return row ?? null
  },

  update: async (id, updates) => {
    const { data: row, error } = await supabase
      .from('accounts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    if (row) set((s) => ({ accounts: s.accounts.map((a) => (a.id === id ? row : a)) }))
  },

  remove: async (id) => {
    const { error } = await supabase.from('accounts').delete().eq('id', id)
    if (error) throw error
    set((s) => ({ accounts: s.accounts.filter((a) => a.id !== id) }))
  },
}))
