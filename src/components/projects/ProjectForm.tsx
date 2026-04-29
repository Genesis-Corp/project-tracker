import { useState } from 'react'
import type { Account, Project } from '../../types'
import { Modal } from '../shared/Modal'
import { TagBadge } from '../shared/TagBadge'
import { useProjectStore } from '../../store/projectStore'

type FormData = Omit<Project, 'id' | 'created_at' | 'updated_at'>

function makeDefault(accounts: Account[]): FormData {
  return {
    name: '',
    account_id: accounts[0]?.id ?? '',
    status: 'active',
    priority: 'medium',
    due_date: null,
    conversation_url: null,
    continued_from_project_id: null,
    context_snapshot: null,
    domain_tags: [],
    model: '',
  }
}

interface Props {
  project?: Project
  accounts: Account[]
  prefill?: { name?: string; context_snapshot?: string }
  onClose: () => void
  onCreated?: (project: Project) => void
}

export function ProjectForm({ project, accounts, prefill, onClose, onCreated }: Props) {
  const { add, update, projects } = useProjectStore()
  const [form, setForm] = useState<FormData>(() => {
    if (project) {
      return {
        name: project.name,
        account_id: project.account_id,
        status: project.status,
        priority: project.priority,
        due_date: project.due_date,
        conversation_url: project.conversation_url,
        continued_from_project_id: project.continued_from_project_id,
        context_snapshot: project.context_snapshot,
        domain_tags: project.domain_tags,
        model: project.model,
      }
    }
    const d = makeDefault(accounts)
    if (prefill?.name) d.name = prefill.name
    if (prefill?.context_snapshot) d.context_snapshot = prefill.context_snapshot
    return d
  })
  const [tagInput, setTagInput] = useState('')
  const isEdit = Boolean(project)

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function addTag() {
    const tag = tagInput.trim()
    if (tag && !form.domain_tags.includes(tag)) {
      setField('domain_tags', [...form.domain_tags, tag])
    }
    setTagInput('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEdit && project) {
      await update(project.id, form)
      onClose()
    } else {
      const created = await add(form)
      if (created && onCreated) onCreated(created)
      onClose()
    }
  }

  const otherProjects = projects.filter((p) => p.id !== project?.id)

  return (
    <Modal title={isEdit ? 'Edit Project' : 'New Project'} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Name *" className="col-span-2">
            <input className="input" value={form.name} onChange={(e) => setField('name', e.target.value)} required />
          </Field>

          <Field label="Account *">
            <select className="input" value={form.account_id} onChange={(e) => setField('account_id', e.target.value)} required>
              <option value="">Select account…</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Model used">
            <input className="input" value={form.model} onChange={(e) => setField('model', e.target.value)} placeholder="claude-sonnet-4-6, gpt-4o…" />
          </Field>

          <Field label="Status">
            <select className="input" value={form.status} onChange={(e) => setField('status', e.target.value as Project['status'])}>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="abandoned">Abandoned</option>
            </select>
          </Field>

          <Field label="Priority">
            <select className="input" value={form.priority} onChange={(e) => setField('priority', e.target.value as Project['priority'])}>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </Field>

          <Field label="Due date">
            <input className="input" type="date" value={form.due_date ?? ''} onChange={(e) => setField('due_date', e.target.value || null)} />
          </Field>

          <Field label="Conversation URL" className="col-span-2">
            <input className="input" type="url" value={form.conversation_url ?? ''} onChange={(e) => setField('conversation_url', e.target.value || null)} placeholder="https://…" />
          </Field>

          <Field label="Continued from (cross-account link)" className="col-span-2">
            <select className="input" value={form.continued_from_project_id ?? ''} onChange={(e) => setField('continued_from_project_id', e.target.value || null)}>
              <option value="">None</option>
              {otherProjects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Context snapshot — where things left off">
          <textarea
            className="input min-h-[96px] resize-none"
            value={form.context_snapshot ?? ''}
            onChange={(e) => setField('context_snapshot', e.target.value || null)}
            placeholder="Summarise what was last discussed so you can resume easily…"
          />
        </Field>

        <Field label="Domain tags">
          <div className="flex gap-2">
            <input
              className="input flex-1"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
              placeholder="coding, research… + Enter"
            />
            <button type="button" onClick={addTag} className="btn-secondary">Add</button>
          </div>
          {form.domain_tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {form.domain_tags.map((tag) => (
                <TagBadge key={tag} tag={tag} onRemove={() => setField('domain_tags', form.domain_tags.filter((t) => t !== tag))} />
              ))}
            </div>
          )}
        </Field>

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary">{isEdit ? 'Save changes' : 'Create project'}</button>
        </div>
      </form>
    </Modal>
  )
}

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-xs font-medium text-gray-500">{label}</label>
      {children}
    </div>
  )
}
