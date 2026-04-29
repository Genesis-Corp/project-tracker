import { useEffect } from 'react'
import { X, ExternalLink, Link2, Pencil } from 'lucide-react'
import { format } from 'date-fns'
import type { Project } from '../../types'
import { useProjectStore } from '../../store/projectStore'
import { useAccountStore } from '../../store/accountStore'
import { StatusBadge } from '../shared/StatusBadge'
import { PriorityBadge } from '../shared/PriorityBadge'
import { TagBadge } from '../shared/TagBadge'
import { TaskList } from './TaskList'
import { HistoryLog } from './HistoryLog'

interface Props {
  project: Project
  onClose: () => void
  onEdit: (project: Project) => void
}

export function ProjectDetail({ project, onClose, onEdit }: Props) {
  const { tasks, history, fetchTasks, fetchHistory, projects } = useProjectStore()
  const { accounts } = useAccountStore()
  const account = accounts.find((a) => a.id === project.account_id)
  const linkedFrom = project.continued_from_project_id
    ? projects.find((p) => p.id === project.continued_from_project_id)
    : null

  useEffect(() => {
    fetchTasks(project.id)
    fetchHistory(project.id)
  }, [project.id])

  const projectTasks = tasks[project.id] ?? []
  const projectHistory = history[project.id] ?? []

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-surface border-l border-white/10 h-full overflow-y-auto shadow-2xl">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-white truncate">{project.name}</h2>
              {account && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {account.name} · {account.platform}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button onClick={() => onEdit(project)} className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5">
                <Pencil size={12} />
                Edit
              </button>
              <button
                onClick={onClose}
                aria-label="Close project detail"
                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={project.status} type="project" />
            <PriorityBadge priority={project.priority} />
            {project.due_date && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                Due {format(new Date(project.due_date), 'd MMM yyyy')}
              </span>
            )}
          </div>

          {/* Cross-account link */}
          {linkedFrom && (
            <div className="flex items-center gap-2 text-sm bg-white/5 rounded-xl px-3 py-2.5">
              <Link2 size={14} className="text-gray-500 shrink-0" />
              <span className="text-gray-400">
                Continued from{' '}
                <span className="text-white font-medium">{linkedFrom.name}</span>
              </span>
            </div>
          )}

          {/* Conversation URL */}
          {project.conversation_url && (
            <a
              href={project.conversation_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors"
            >
              <ExternalLink size={14} />
              Open conversation
            </a>
          )}

          {/* Context snapshot */}
          {project.context_snapshot && (
            <div>
              <p className="section-label mb-2">Context snapshot</p>
              <p className="text-sm text-gray-300 bg-white/5 rounded-xl px-4 py-3 whitespace-pre-wrap leading-relaxed">
                {project.context_snapshot}
              </p>
            </div>
          )}

          {/* Tags */}
          {project.domain_tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {project.domain_tags.map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
            </div>
          )}

          {/* Tasks */}
          <div>
            <p className="section-label mb-3">
              Tasks ({projectTasks.filter((t) => t.status !== 'done').length} open)
            </p>
            <TaskList projectId={project.id} tasks={projectTasks} />
          </div>

          {/* History */}
          <div>
            <p className="section-label mb-3">History</p>
            <HistoryLog entries={projectHistory} />
          </div>
        </div>
      </div>
    </div>
  )
}
