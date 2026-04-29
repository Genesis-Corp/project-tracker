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
          const account = accounts.find((a) => a.id === project.account_id)
          return (
            <div key={project.id} className="card flex items-center gap-3 border-l-4 border-l-orange-500">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{project.name}</p>
                {account && <p className="text-xs text-gray-500 truncate">{account.name}</p>}
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
