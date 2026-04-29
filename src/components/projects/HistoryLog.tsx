import { formatDistanceToNow } from 'date-fns'
import type { ProjectHistory } from '../../types'

export function HistoryLog({ entries }: { entries: ProjectHistory[] }) {
  if (entries.length === 0) {
    return <p className="text-xs text-gray-600">No changes logged yet.</p>
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div key={entry.id} className="flex items-start gap-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-700 mt-1.5 shrink-0" />
          <div>
            <p className="text-xs text-gray-300">{entry.change_summary}</p>
            <p className="text-xs text-gray-600 mt-0.5">
              {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
