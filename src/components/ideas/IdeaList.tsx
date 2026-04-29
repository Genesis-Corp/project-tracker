import type { Idea, Project } from '../../types'
import { IdeaCard } from './IdeaCard'

interface Props {
  ideas: Idea[]
  projects: Project[]
  onEdit: (idea: Idea) => void
  onDelete: (id: string) => void
  onPromote: (idea: Idea) => void
}

export function IdeaList({ ideas, projects, onEdit, onDelete, onPromote }: Props) {
  if (ideas.length === 0) {
    return (
      <div className="text-center py-16 text-gray-600">
        <p className="text-lg mb-1">No ideas yet</p>
        <p className="text-sm">Capture your first idea before it disappears</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {ideas.map((idea) => (
        <IdeaCard
          key={idea.id}
          idea={idea}
          linkedProject={projects.find((p) => p.id === idea.project_id)}
          onEdit={onEdit}
          onDelete={onDelete}
          onPromote={onPromote}
        />
      ))}
    </div>
  )
}
