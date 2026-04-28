import type { AccountStatus, ProjectStatus } from '../../types'

const accountColors: Record<AccountStatus, string> = {
  ready: 'bg-green-500/20 text-green-400 border-green-500/30',
  limited: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  exhausted: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const projectColors: Record<ProjectStatus, string> = {
  active: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  paused: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  abandoned: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

interface Props {
  status: AccountStatus | ProjectStatus
  type: 'account' | 'project'
}

export function StatusBadge({ status, type }: Props) {
  const colors =
    type === 'account'
      ? accountColors[status as AccountStatus]
      : projectColors[status as ProjectStatus]
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${colors}`}>
      {status}
    </span>
  )
}
