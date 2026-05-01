import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useEmailStore } from '../store/emailStore'
import { useAccountStore } from '../store/accountStore'
import { useProjectStore } from '../store/projectStore'
import { useIdeaStore } from '../store/ideaStore'
import { EmailList } from '../components/accounts/EmailList'
import { EmailForm } from '../components/accounts/EmailForm'
import { AccountCard } from '../components/accounts/AccountCard'
import { AccountForm } from '../components/accounts/AccountForm'
import type { Account, EmailIdentity } from '../types'

export function Accounts() {
  const { emails, loading, fetch: fetchEmails, remove: removeEmail } = useEmailStore()
  const { accounts, fetch: fetchAccounts, remove: removeAccount } = useAccountStore()
  const { projects, tasks, fetch: fetchProjects, fetchAllOpenTasks } = useProjectStore()
  const { ideas, fetch: fetchIdeas } = useIdeaStore()

  const [showEmailForm, setShowEmailForm] = useState(false)
  const [editEmail, setEditEmail] = useState<EmailIdentity | null>(null)
  const [showAccountForm, setShowAccountForm] = useState(false)
  const [editAccount, setEditAccount] = useState<Account | null>(null)
  const [defaultEmailId, setDefaultEmailId] = useState<string | undefined>()

  useEffect(() => {
    fetchEmails()
    fetchAccounts()
    fetchProjects()
    fetchAllOpenTasks()
    fetchIdeas()
  }, [])

  // Compute per-email stats from store data
  const emailStats = emails.map((email) => {
    const linkedAccounts = accounts.filter((a) => a.email_id === email.id)
    const linkedAccountIds = new Set(linkedAccounts.map((a) => a.id))
    const linkedProjects = projects.filter((p) =>
      p.account_ids.some((aid) => linkedAccountIds.has(aid))
    )
    const linkedProjectIds = new Set(linkedProjects.map((p) => p.id))
    const activeProjects = linkedProjects.filter((p) => p.status === 'active').length
    const openTasks = [...linkedProjectIds]
      .flatMap((pid) => tasks[pid] ?? [])
      .filter((t) => t.status === 'todo' || t.status === 'in_progress')
      .length
    const linkedIdeas = ideas.filter(
      (i) => i.project_id !== null && linkedProjectIds.has(i.project_id)
    ).length
    return { email, accounts: linkedAccounts, activeProjects, openTasks, ideas: linkedIdeas }
  })

  const unlinkedAccounts = accounts.filter((a) => !a.email_id)

  function handleAddAccount(emailId: string) {
    setDefaultEmailId(emailId)
    setEditAccount(null)
    setShowAccountForm(true)
  }

  function handleEditAccount(account: Account) {
    setEditAccount(account)
    setDefaultEmailId(undefined)
    setShowAccountForm(true)
  }

  function handleEditEmail(email: EmailIdentity) {
    setEditEmail(email)
    setShowEmailForm(true)
  }

  function closeEmailForm() {
    setShowEmailForm(false)
    setEditEmail(null)
  }

  function closeAccountForm() {
    setShowAccountForm(false)
    setEditAccount(null)
    setDefaultEmailId(undefined)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Accounts</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {emails.length} email{emails.length !== 1 ? 's' : ''} · {accounts.length} account{accounts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => setShowEmailForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={15} />
          Add email
        </button>
      </div>

      {loading ? (
        <p className="text-gray-600 text-sm">Loading…</p>
      ) : (
        <EmailList
          emailStats={emailStats}
          onEdit={handleEditEmail}
          onDelete={removeEmail}
          onAddAccount={handleAddAccount}
          onEditAccount={handleEditAccount}
          onDeleteAccount={removeAccount}
        />
      )}

      {unlinkedAccounts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-400">Unlinked accounts</h2>
            <button
              onClick={() => { setDefaultEmailId(undefined); setEditAccount(null); setShowAccountForm(true) }}
              className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1"
            >
              <Plus size={12} />
              Add account
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {unlinkedAccounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onEdit={handleEditAccount}
                onDelete={removeAccount}
              />
            ))}
          </div>
        </div>
      )}

      {showEmailForm && (
        <EmailForm emailIdentity={editEmail ?? undefined} onClose={closeEmailForm} />
      )}
      {showAccountForm && (
        <AccountForm
          account={editAccount ?? undefined}
          emails={emails}
          defaultEmailId={defaultEmailId}
          onClose={closeAccountForm}
        />
      )}
    </div>
  )
}
