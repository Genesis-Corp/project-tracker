import type { Account, EmailIdentity } from '../../types'
import { EmailCard } from './EmailCard'

export interface EmailStats {
  email: EmailIdentity
  accounts: Account[]
  activeProjects: number
  openTasks: number
  ideas: number
}

interface Props {
  emailStats: EmailStats[]
  onEdit: (email: EmailIdentity) => void
  onDelete: (id: string) => void
  onAddAccount: (emailId: string) => void
  onEditAccount: (account: Account) => void
  onDeleteAccount: (id: string) => void
}

export function EmailList({
  emailStats,
  onEdit,
  onDelete,
  onAddAccount,
  onEditAccount,
  onDeleteAccount,
}: Props) {
  if (emailStats.length === 0) {
    return (
      <div className="text-center py-16 text-gray-600">
        <p className="text-lg mb-1">No emails yet</p>
        <p className="text-sm">Add an email to start grouping your accounts</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {emailStats.map(({ email, accounts, activeProjects, openTasks, ideas }) => (
        <EmailCard
          key={email.id}
          email={email}
          accounts={accounts}
          activeProjects={activeProjects}
          openTasks={openTasks}
          ideas={ideas}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddAccount={onAddAccount}
          onEditAccount={onEditAccount}
          onDeleteAccount={onDeleteAccount}
        />
      ))}
    </div>
  )
}
