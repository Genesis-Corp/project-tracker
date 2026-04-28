import type { Account } from '../../types'
import { AccountCard } from './AccountCard'

interface Props {
  accounts: Account[]
  onEdit: (account: Account) => void
  onDelete: (id: string) => void
}

export function AccountList({ accounts, onEdit, onDelete }: Props) {
  if (accounts.length === 0) {
    return (
      <div className="text-center py-16 text-gray-600">
        <p className="text-lg mb-1">No accounts yet</p>
        <p className="text-sm">Add your first AI account to get started</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {accounts.map((account) => (
        <AccountCard key={account.id} account={account} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  )
}
