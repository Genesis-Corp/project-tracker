import type { Account } from '../../types'
import { StatusBadge } from '../shared/StatusBadge'
import { CountdownTimer } from '../shared/CountdownTimer'
import { UsageBar } from '../shared/UsageBar'

export function AccountSummary({ accounts }: { accounts: Account[] }) {
  if (accounts.length === 0) return null

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-400 mb-3">Accounts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {accounts.map((account) => (
          <div key={account.id} className="card space-y-2 border-l-4 border-l-violet-500">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{account.name}</p>
                <p className="text-xs text-gray-500 truncate">{account.platform}</p>
              </div>
              <StatusBadge status={account.status} type="account" />
            </div>
            <UsageBar used={account.limit_used} total={account.limit_total} type={account.limit_type} />
            <CountdownTimer resetAt={account.reset_at} />
          </div>
        ))}
      </div>
    </div>
  )
}
