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
