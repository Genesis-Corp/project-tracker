import { useEffect } from 'react'
import { useAccountStore } from '../store/accountStore'
import { useProjectStore } from '../store/projectStore'
import { useIdeaStore } from '../store/ideaStore'
import { StatsBar } from '../components/dashboard/StatsBar'
import { AccountSummary } from '../components/dashboard/AccountSummary'
import { ActiveProjects } from '../components/dashboard/ActiveProjects'

const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 }

export function Dashboard() {
  const { accounts, fetch: fetchAccounts } = useAccountStore()
  const { projects, openTaskCount, fetch: fetchProjects, fetchOpenTaskCount } = useProjectStore()
  const { ideas, fetch: fetchIdeas } = useIdeaStore()

  // Initialize all stores on mount — store fetch functions are stable references
  useEffect(() => {
    fetchAccounts()
    fetchProjects()
    fetchIdeas()
    fetchOpenTaskCount()
  }, [])

  const activeProjects = [...projects]
    .filter((p) => p.status === 'active')
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your AI command centre</p>
      </div>

      <StatsBar
        readyAccounts={accounts.filter((a) => a.status === 'ready').length}
        activeProjects={activeProjects.length}
        openTasks={openTaskCount}
        totalIdeas={ideas.length}
      />

      <AccountSummary accounts={accounts} />
      <ActiveProjects projects={activeProjects} accounts={accounts} />
    </div>
  )
}
