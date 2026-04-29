import { useState } from 'react'
import type { Idea, Project } from '../../types'
import { Modal } from '../shared/Modal'
import { TagBadge } from '../shared/TagBadge'
import { useIdeaStore } from '../../store/ideaStore'

type FormData = Omit<Idea, 'id' | 'created_at' | 'updated_at'>

interface Props {
  idea?: Idea
  projects: Project[]
  prefill?: { title?: string; body?: string }
  onClose: () => void
}

export function IdeaForm({ idea, projects, prefill, onClose }: Props) {
  const { add, update } = useIdeaStore()
  const [form, setForm] = useState<FormData>(() => ({
    title: idea?.title ?? prefill?.title ?? '',
    body: idea?.body ?? prefill?.body ?? null,
    project_id: idea?.project_id ?? null,
    tags: idea?.tags ?? [],
  }))
  const [tagInput, setTagInput] = useState('')
  const isEdit = Boolean(idea)

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function addTag() {
    const tag = tagInput.trim()
    if (tag && !form.tags.includes(tag)) setField('tags', [...form.tags, tag])
    setTagInput('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEdit && idea) {
      await update(idea.id, form)
    } else {
      await add(form)
    }
    onClose()
  }

  return (
    <Modal title={isEdit ? 'Edit Idea' : 'New Idea'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500">Title *</label>
          <input className="input" value={form.title} onChange={(e) => setField('title', e.target.value)} required autoFocus />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500">Details</label>
          <textarea
            className="input min-h-[80px] resize-none"
            value={form.body ?? ''}
            onChange={(e) => setField('body', e.target.value || null)}
            placeholder="Any extra context…"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500">Link to project (optional)</label>
          <select className="input" value={form.project_id ?? ''} onChange={(e) => setField('project_id', e.target.value || null)}>
            <option value="">Global (no project)</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500">Tags</label>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
              placeholder="Add tag + Enter"
            />
            <button type="button" onClick={addTag} className="btn-secondary">Add</button>
          </div>
          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {form.tags.map((tag) => (
                <TagBadge key={tag} tag={tag} onRemove={() => setField('tags', form.tags.filter((t) => t !== tag))} />
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary">{isEdit ? 'Save' : 'Add idea'}</button>
        </div>
      </form>
    </Modal>
  )
}
