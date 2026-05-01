import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useIdeaStore } from '../store/ideaStore'
import { useProjectStore } from '../store/projectStore'
import { useAccountStore } from '../store/accountStore'
import { useEmailStore } from '../store/emailStore'
import { IdeaList } from '../components/ideas/IdeaList'
import { IdeaForm } from '../components/ideas/IdeaForm'
import { ProjectForm } from '../components/projects/ProjectForm'
import type { Idea, Project } from '../types'

export function Ideas() {
  const { ideas, loading, fetch, remove, update: updateIdea } = useIdeaStore()
  const { projects, fetch: fetchProjects } = useProjectStore()
  const { accounts, fetch: fetchAccounts } = useAccountStore()
  const { emails, fetch: fetchEmails } = useEmailStore()
  const [showIdeaForm, setShowIdeaForm] = useState(false)
  const [editIdea, setEditIdea] = useState<Idea | null>(null)
  const [promoteIdea, setPromoteIdea] = useState<Idea | null>(null)

  useEffect(() => {
    fetch()
    fetchProjects()
    fetchAccounts()
    fetchEmails()
  }, [])

  function handleEdit(idea: Idea) {
    setEditIdea(idea)
    setShowIdeaForm(true)
  }

  function handleIdeaFormClose() {
    setShowIdeaForm(false)
    setEditIdea(null)
  }

  async function handleProjectCreated(project: Project) {
    if (promoteIdea) {
      await updateIdea(promoteIdea.id, { project_id: project.id })
    }
    setPromoteIdea(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ideas</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {ideas.length} idea{ideas.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => setShowIdeaForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={15} />
          New idea
        </button>
      </div>

      {loading ? (
        <p className="text-gray-600 text-sm">Loading…</p>
      ) : (
        <IdeaList
          ideas={ideas}
          projects={projects}
          onEdit={handleEdit}
          onDelete={remove}
          onPromote={setPromoteIdea}
        />
      )}

      {showIdeaForm && (
        <IdeaForm
          idea={editIdea ?? undefined}
          projects={projects}
          onClose={handleIdeaFormClose}
        />
      )}

      {promoteIdea && (
        <ProjectForm
          accounts={accounts}
          emails={emails}
          prefill={{ name: promoteIdea.title, context_snapshot: promoteIdea.body ?? undefined }}
          onClose={() => setPromoteIdea(null)}
          onCreated={handleProjectCreated}
        />
      )}
    </div>
  )
}
