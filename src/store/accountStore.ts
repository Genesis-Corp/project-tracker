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
