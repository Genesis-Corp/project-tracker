import { useState } from 'react'
import type { Account, EmailIdentity, Project } from '../../types'
import { Modal } from '../shared/Modal'
import { TagBadge } from '../shared/TagBadge'
import { useProjectStore } from '../../store/projectStore'

type FormData = Omit<Project, 'id' | 'created_at' | 'updated_at'>

function makeDefault(): FormData {
  return {
    name: '',
    account_ids: [],
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
  emails: EmailIdentity[]
  prefill?: { name?: string; context_snapshot?: string }
  onClose: () => void
  onCreated?: (project: Project) => void
}

export function ProjectForm({ project, accounts, emails, prefill, onClose, onCreated }: Props) {
  const { add, update, projects } = useProjectStore()
  const [form, setForm] = useState<FormData>(() => {
    if (project) {
      return {
        name: project.name,
        account_ids: project.account_ids,
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
    const d = makeDefault()
    if (prefill?.name) d.name = prefill.name
    if (prefill?.context_snapshot) d.context_snapshot = prefill.context_snapshot
    return d
  })
  const [tagInput, setTagInput] = useState('')
  const isEdit = Boolean(project)

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function toggleAccount(accountId: string) {
    setField(
      'account_ids',
      form.account_ids.includes(accountId)
        ? form.account_ids.filter((id) => id !== accountId)
        : [...form.account_ids, accountId]
    )
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

  // Group accounts by email for the selector
  const accountsByEmail = emails.map((ei) => ({
    email: ei,
    accounts: accounts.filter((a) => a.email_id === ei.id),
  })).filter((g) => g.accounts.length > 0)
  const unlinkedAccounts = accounts.filter((a) => !a.email_id)

  return (
    <Modal title={isEdit ? 'Edit Project' : 'New Project'} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Name *" className="col-span-2">
            <input className="input" value={form.name} onChange={(e) => setField('name', e.target.value)} required />
          </Field>

          <Field label="Accounts" className="col-span-2">
            <div className="border border-white/10 rounded-xl p-3 space-y-3 max-h-44 overflow-y-auto">
              {accountsByEmail.map(({ email, accounts: emailAccounts }) => (
                <div key={email.id}>
                  <p className="text-[10px] text-gray-600 mb-1.5 uppercase tracking-wide">{email.email}</p>
                  <div className="space-y-1">
                    {emailAccounts.map((a) => (
                      <label key={a.id} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={form.account_ids.includes(a.id)}
                          onChange={() => toggleAccount(a.id)}
                          className="accent-violet-500"
                        />
                        <span className="text-xs text-gray-300 group-hover:text-white transition-colors">
                          {a.name} · {a.platform}
                          {a.subscription ? ` (${a.subscription})` : ''}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              {unlinkedAccounts.length > 0 && (
                <div>
                  {accountsByEmail.length > 0 && <div className="border-t border-white/5 pt-2" />}
                  <p className="text-[10px] text-gray-600 mb-1.5 uppercase tracking-wide">Unlinked</p>
                  <div className="space-y-1">
                    {unlinkedAccounts.map((a) => (
                      <label key={a.id} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={form.account_ids.includes(a.id)}
                          onChange={() => toggleAccount(a.id)}
                          className="accent-violet-500"
                        />
                        <span className="text-xs text-gray-300 group-hover:text-white transition-colors">
                          {a.name} · {a.platform}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {accounts.length === 0 && (
                <p className="text-xs text-gray-600 text-center py-2">No accounts yet — add one in the Accounts page</p>
              )}
            </div>
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
