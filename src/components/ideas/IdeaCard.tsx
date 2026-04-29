import { Lightbulb, Pencil, Trash2, ArrowUpRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { Idea, Project } from '../../types'
import { TagBadge } from '../shared/TagBadge'

interface Props {
  idea: Idea
  linkedProject: Project | undefined
  onEdit: (idea: Idea) => void
  onDelete: (id: string) => void
  onPromote: (idea: Idea) => void
}

export function IdeaCard({ idea, linkedProject, onEdit, onDelete, onPromote }: Props) {
  return (
    <div className="bg-surface rounded-2xl border border-white/10 border-l-4 border-l-teal-500 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Lightbulb size={15} className="text-teal-400 shrink-0" />
          <h3 className="font-semibold text-white text-sm truncate">{idea.title}</h3>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onPromote(idea)}
            aria-label="Promote to project"
            className="p-1.5 rounded-lg hover:bg-teal-500/20 text-gray-500 hover:text-teal-400 transition-colors"
          >
            <ArrowUpRight size={13} />
          </button>
          <button
            onClick={() => onEdit(idea)}
            aria-label="Edit idea"
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(idea.id)}
            aria-label="Delete idea"
            className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {idea.body && <p className="text-xs text-gray-400 line-clamp-3">{idea.body}</p>}

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {idea.tags.map((tag) => <TagBadge key={tag} tag={tag} />)}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          {linkedProject && (
            <span className="text-teal-700">→ {linkedProject.name}</span>
          )}
          <span>{formatDistanceToNow(new Date(idea.created_at), { addSuffix: true })}</span>
        </div>
      </div>
    </div>
  )
}
