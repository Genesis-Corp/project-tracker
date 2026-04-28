import { Bot, Pencil, Trash2 } from 'lucide-react'
import type { Account } from '../../types'
import { StatusBadge } from '../shared/StatusBadge'
import { CountdownTimer } from '../shared/CountdownTimer'
import { UsageBar } from '../shared/UsageBar'
import { TagBadge } from '../shared/TagBadge'

interface Props {
  account: Account
  onEdit: (account: Account) => void
  onDelete: (id: string) => void
}

export function AccountCard({ account, onEdit, onDelete }: Props) {
  return (
    <div className="bg-surface rounded-2xl border border-white/10 border-l-4 border-l-violet-500 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Bot size={16} className="text-violet-400 shrink-0" />
          <div className="min-w-0">
            <h3 className="font-semibold text-white text-sm truncate">{account.name}</h3>
            <p className="text-xs text-gray-500 truncate">
              {account.platform}
              {account.model ? ` · ${account.model}` : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <StatusBadge status={account.status} type="account" />
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

      <UsageBar used={account.limit_used} total={account.limit_total} type={account.limit_type} />
      <CountdownTimer resetAt={account.reset_at} />

      <div className="flex items-center gap-2 text-xs text-gray-600">
        {account.login_method === 'browser' && account.browser ? (
          <span>{account.browser}</span>
        ) : (
          <span>App</span>
        )}
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
