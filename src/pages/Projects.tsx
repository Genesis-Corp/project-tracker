import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useProjectStore } from '../store/projectStore'
import { useAccountStore } from '../store/accountStore'
import { useEmailStore } from '../store/emailStore'
import { ProjectCard } from '../components/projects/ProjectCard'
import { ProjectForm } from '../components/projects/ProjectForm'
import { ProjectDetail } from '../components/projects/ProjectDetail'
import type { Project } from '../types'

const priorityOrder: Record<string, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
}

export function Projects() {
  const { projects, tasks, loading, fetch, remove, fetchAllOpenTasks, updateTask } = useProjectStore()
  const { accounts, fetch: fetchAccounts } = useAccountStore()
  const { emails, fetch: fetchEmails } = useEmailStore()
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<Project | null>(null)
  const [detailTarget, setDetailTarget] = useState<Project | null>(null)

  useEffect(() => {
    fetch()
    fetchAccounts()
    fetchEmails()
    fetchAllOpenTasks()
  }, [])

  const sorted = [...projects].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
  )

  function handleEdit(project: Project) {
    setDetailTarget(null)
    setEditTarget(project)
    setShowForm(true)
  }

  function handleClose() {
    setShowForm(false)
    setEditTarget(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={15} />
          New project
        </button>
      </div>

      {loading ? (
        <p className="text-gray-600 text-sm">Loading…</p>
      ) : sorted.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <p className="text-lg mb-1">No projects yet</p>
          <p className="text-sm">Create your first project to start tracking</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {sorted.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              accounts={accounts.filter((a) => project.account_ids.includes(a.id))}
              openTasks={tasks[project.id] ?? []}
              onTaskToggle={(taskId) => updateTask(taskId, { status: 'done' })}
              onClick={() => setDetailTarget(project)}
              onEdit={handleEdit}
              onDelete={remove}
            />
          ))}
        </div>
      )}

      {showForm && (
        <ProjectForm
          project={editTarget ?? undefined}
          accounts={accounts}
          emails={emails}
          onClose={handleClose}
        />
      )}

      {detailTarget && (
        <ProjectDetail
          project={detailTarget}
          onClose={() => setDetailTarget(null)}
          onEdit={handleEdit}
        />
      )}
    </div>
  )
}
