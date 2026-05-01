import { useState } from 'react'
import { Mail, Pencil, Trash2, ChevronDown, ChevronUp, Plus } from 'lucide-react'
import type { Account, EmailIdentity } from '../../types'
import { AccountCard } from './AccountCard'

interface Props {
  email: EmailIdentity
  accounts: Account[]
  activeProjects: number
  openTasks: number
  ideas: number
  onEdit: (email: EmailIdentity) => void
  onDelete: (id: string) => void
  onAddAccount: (emailId: string) => void
  onEditAccount: (account: Account) => void
  onDeleteAccount: (id: string) => void
}

export function EmailCard({
  email,
  accounts,
  activeProjects,
  openTasks,
  ideas,
  onEdit,
  onDelete,
  onAddAccount,
  onEditAccount,
  onDeleteAccount,
}: Props) {
  const [expanded, setExpanded] = useState(false)

  const stats = [
    { label: 'Accounts', value: accounts.length },
    { label: 'Active', value: activeProjects },
    { label: 'Tasks', value: openTasks },
    { label: 'Ideas', value: ideas },
  ]

  return (
    <div className="bg-surface rounded-2xl border border-white/10 border-l-4 border-l-violet-500 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Mail size={16} className="text-violet-400 shrink-0" />
          <div className="min-w-0">
            <h3 className="font-semibold text-white text-sm truncate">{email.email}</h3>
            {email.label && <p className="text-xs text-gray-500">{email.label}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(email)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
            aria-label="Edit email"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(email.id)}
            className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
            aria-label="Delete email"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {stats.map(({ label, value }) => (
          <div key={label} className="bg-white/5 rounded-xl p-2 text-center">
            <p className="text-base font-bold text-white">{value}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {email.notes && (
        <p className="text-xs text-gray-500 line-clamp-2">{email.notes}</p>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors"
        >
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {expanded
            ? 'Hide accounts'
            : `Show ${accounts.length} account${accounts.length !== 1 ? 's' : ''}`}
        </button>
        <button
          onClick={() => onAddAccount(email.id)}
          className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors ml-auto"
        >
          <Plus size={12} />
          Add account
        </button>
      </div>

      {expanded && (
        <div className="space-y-3 pt-1 border-t border-white/5">
          {accounts.length === 0 ? (
            <p className="text-xs text-gray-600 text-center py-2">No accounts linked yet</p>
          ) : (
            accounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onEdit={onEditAccount}
                onDelete={onDeleteAccount}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}
