import type { Account, Project } from '../../types'
import { StatusBadge } from '../shared/StatusBadge'
import { PriorityBadge } from '../shared/PriorityBadge'

interface Props {
  projects: Project[]
  accounts: Account[]
}

export function ActiveProjects({ projects, accounts }: Props) {
  if (projects.length === 0) return null

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-400 mb-3">Active projects</h2>
      <div className="space-y-2">
        {projects.map((project) => {
          const projectAccounts = accounts.filter((a) => project.account_ids.includes(a.id))
          const accountLabel = projectAccounts.length === 1
            ? `${projectAccounts[0].name} · ${projectAccounts[0].platform}`
            : projectAccounts.length > 1
              ? `${projectAccounts[0].name} +${projectAccounts.length - 1}`
              : null
          return (
            <div key={project.id} className="card flex items-center gap-3 border-l-4 border-l-orange-500">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{project.name}</p>
                {accountLabel && <p className="text-xs text-gray-500 truncate">{accountLabel}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <PriorityBadge priority={project.priority} />
                <StatusBadge status={project.status} type="project" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
