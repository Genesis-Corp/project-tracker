import { useState } from 'react'
import { Bot, Pencil, Trash2, Clock } from 'lucide-react'
import type { Account } from '../../types'
import { StatusBadge } from '../shared/StatusBadge'
import { CountdownTimer } from '../shared/CountdownTimer'
import { UsageBar } from '../shared/UsageBar'
import { TagBadge } from '../shared/TagBadge'
import { useAccountStore } from '../../store/accountStore'

interface Props {
  account: Account
  onEdit: (account: Account) => void
  onDelete: (id: string) => void
}

export function AccountCard({ account, onEdit, onDelete }: Props) {
  const { update } = useAccountStore()
  const [showResetPicker, setShowResetPicker] = useState(false)
  const [resetValue, setResetValue] = useState(
    account.reset_at ? account.reset_at.slice(0, 16) : ''
  )

  async function handleSetReset() {
    await update(account.id, {
      reset_at: resetValue ? new Date(resetValue).toISOString() : null,
    })
    setShowResetPicker(false)
  }

  function loginMethodDisplay() {
    if (account.login_method === 'browser' && account.browser) return account.browser
    if (account.login_method === 'terminal') return 'Terminal'
    return 'App'
  }

  return (
    <div className="bg-surface rounded-2xl border border-white/10 border-l-4 border-l-violet-500 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Bot size={16} className="text-violet-400 shrink-0" />
          <div className="min-w-0">
            <h3 className="font-semibold text-white text-sm truncate">{account.name}</h3>
            <p className="text-xs text-gray-500 truncate">
              {account.platform}
              {account.subscription ? ` · ${account.subscription}` : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <StatusBadge status={account.status} type="account" />
          <button
            onClick={() => setShowResetPicker(!showResetPicker)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-teal-400 transition-colors"
            aria-label="Set reset time"
            title="Resets @"
          >
            <Clock size={13} />
          </button>
          <button
            onClick={() => onEdit(account)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
            aria-label="Edit account"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(account.id)}
            className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
            aria-label="Delete account"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {showResetPicker && (
        <div className="flex items-center gap-2">
          <input
            type="datetime-local"
            className="input text-xs flex-1"
            value={resetValue}
            onChange={(e) => setResetValue(e.target.value)}
          />
          <button type="button" onClick={handleSetReset} className="btn-primary text-xs py-1 px-3">Set</button>
          <button type="button" onClick={() => setShowResetPicker(false)} className="btn-secondary text-xs py-1 px-2">✕</button>
        </div>
      )}

      <UsageBar used={account.limit_used} total={account.limit_total} type={account.limit_type} />
      <CountdownTimer resetAt={account.reset_at} />

      <div className="flex items-center gap-2 text-xs text-gray-600">
        <span>{loginMethodDisplay()}</span>
        {account.device && <><span>·</span><span>{account.device}</span></>}
      </div>

      {account.category_tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {account.category_tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}

      {account.notes && (
        <p className="text-xs text-gray-500 line-clamp-2">{account.notes}</p>
      )}
    </div>
  )
}
