import { FolderKanban, Pencil, Trash2, ExternalLink, CheckCircle2, Circle } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import type { Account, Project, Task } from '../../types'
import { StatusBadge } from '../shared/StatusBadge'
import { PriorityBadge } from '../shared/PriorityBadge'
import { TagBadge } from '../shared/TagBadge'

interface Props {
  project: Project
  accounts: Account[]
  openTasks: Task[]
  onTaskToggle: (taskId: string) => void
  onClick: () => void
  onEdit: (project: Project) => void
  onDelete: (id: string) => void
}

export function ProjectCard({ project, accounts, openTasks, onTaskToggle, onClick, onEdit, onDelete }: Props) {
  return (
    <div
      className="bg-surface rounded-2xl border border-white/10 border-l-4 border-l-orange-500 p-4 space-y-3 cursor-pointer hover:border-white/20 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <FolderKanban size={15} className="text-orange-400 shrink-0" />
          <div className="min-w-0">
            <h3 className="font-semibold text-white text-sm truncate">{project.name}</h3>
            {accounts.length > 0 && (
              <p className="text-xs text-gray-500 truncate">
                {accounts[0].name} · {accounts[0].platform}
                {accounts.length > 1 ? ` +${accounts.length - 1} more` : ''}
              </p>
            )}
          </div>
        </div>
        <div
          className="flex items-center gap-1 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onEdit(project)}
            aria-label="Edit project"
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(project.id)}
            aria-label="Delete project"
            className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <StatusBadge status={project.status} type="project" />
        <PriorityBadge priority={project.priority} />
        {project.due_date && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-400">
            Due {format(new Date(project.due_date), 'MMM d, yyyy')}
          </span>
        )}
      </div>

      {project.context_snapshot && (
        <p className="text-xs text-gray-500 line-clamp-2">{project.context_snapshot}</p>
      )}

      {openTasks.length > 0 && (
        <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
          {openTasks.map((task) => {
            const isDone = task.status === 'done'
            return (
              <div key={task.id} className="flex items-center gap-2">
                <button
                  onClick={() => !isDone && onTaskToggle(task.id)}
                  aria-label="Mark task done"
                  className="shrink-0 transition-opacity"
                  disabled={isDone}
                >
                  {isDone
                    ? <CheckCircle2 size={14} className="text-green-400" />
                    : <Circle size={14} className="text-gray-600 hover:text-gray-400" />
                  }
                </button>
                <span className={`text-xs truncate ${isDone ? 'line-through text-gray-600' : 'text-gray-400'}`}>
                  {task.title}
                </span>
              </div>
            )
          })}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {project.domain_tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
        <div className="flex items-center gap-2">
          {project.conversation_url && (
            <a
              href={project.conversation_url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label="Open conversation"
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-violet-400 transition-colors"
            >
              <ExternalLink size={13} />
            </a>
          )}
          <span className="text-xs text-gray-600">
            {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  )
}
