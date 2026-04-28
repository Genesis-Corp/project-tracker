import type { Priority } from '../../types'

const colors: Record<Priority, string> = {
  urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  low: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

const fallback = 'bg-gray-500/20 text-gray-400 border-gray-500/30'

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${colors[priority] ?? fallback}`}>
      {priority}
    </span>
  )
}
