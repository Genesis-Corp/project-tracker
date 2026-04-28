import { useState } from 'react'
import type { Account } from '../../types'
import { Modal } from '../shared/Modal'
import { TagBadge } from '../shared/TagBadge'
import { useAccountStore } from '../../store/accountStore'

type FormData = Omit<Account, 'id' | 'created_at' | 'updated_at'>

const defaultForm: FormData = {
  name: '',
  platform: '',
  model: '',
  login_method: 'browser',
  browser: '',
  device: '',
  limit_type: 'messages',
  limit_total: 10,
  limit_used: 0,
  reset_at: null,
  status: 'ready',
  category_tags: [],
  notes: '',
}

interface Props {
  account?: Account
  onClose: () => void
}

export function AccountForm({ account, onClose }: Props) {
  const { add, update } = useAccountStore()
  const [form, setForm] = useState<FormData>(() =>
    account
      ? {
          name: account.name,
          platform: account.platform,
          model: account.model,
          login_method: account.login_method,
          browser: account.browser,
          device: account.device,
          limit_type: account.limit_type,
          limit_total: account.limit_total,
          limit_used: account.limit_used,
          reset_at: account.reset_at,
          status: account.status,
          category_tags: account.category_tags,
          notes: account.notes,
        }
      : defaultForm,
  )
  const [tagInput, setTagInput] = useState('')
  const isEdit = Boolean(account)

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function addTag() {
    const tag = tagInput.trim()
    if (tag && !form.category_tags.includes(tag)) {
      setField('category_tags', [...form.category_tags, tag])
    }
    setTagInput('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEdit && account) {
      await update(account.id, form)
    } else {
      await add(form)
    }
    onClose()
  }

  return (
    <Modal title={isEdit ? 'Edit Account' : 'Add Account'} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Name *">
            <input className="input" value={form.name} onChange={(e) => setField('name', e.target.value)} required />
          </Field>
          <Field label="Platform *">
            <input className="input" value={form.platform} onChange={(e) => setField('platform', e.target.value)} placeholder="Claude, ChatGPT, Gemini…" required />
          </Field>
          <Field label="Model">
            <input className="input" value={form.model} onChange={(e) => setField('model', e.target.value)} placeholder="claude-sonnet-4-6, gpt-4o…" />
          </Field>
          <Field label="Login method">
            <select className="input" value={form.login_method} onChange={(e) => setField('login_method', e.target.value as 'app' | 'browser')}>
              <option value="browser">Browser</option>
              <option value="app">App</option>
            </select>
          </Field>
          {form.login_method === 'browser' && (
            <Field label="Browser">
              <input className="input" value={form.browser} onChange={(e) => setField('browser', e.target.value)} placeholder="Chrome, Firefox, Edge…" />
            </Field>
          )}
          <Field label="Device">
            <input className="input" value={form.device} onChange={(e) => setField('device', e.target.value)} placeholder="Desktop, Phone, Work Laptop…" />
          </Field>
          <Field label="Limit type">
            <input className="input" value={form.limit_type} onChange={(e) => setField('limit_type', e.target.value)} placeholder="messages, tokens…" />
          </Field>
          <Field label="Limit total">
            <input className="input" type="number" min={1} value={form.limit_total} onChange={(e) => setField('limit_total', Number(e.target.value))} />
          </Field>
          <Field label="Used so far">
            <input className="input" type="number" min={0} value={form.limit_used} onChange={(e) => setField('limit_used', Number(e.target.value))} />
          </Field>
          <Field label="Resets at">
            <input
              className="input"
              type="datetime-local"
              value={form.reset_at ? form.reset_at.slice(0, 16) : ''}
              onChange={(e) =>
                setField('reset_at', e.target.value ? new Date(e.target.value).toISOString() : null)
              }
            />
          </Field>
          <Field label="Status">
            <select className="input" value={form.status} onChange={(e) => setField('status', e.target.value as Account['status'])}>
              <option value="ready">Ready</option>
              <option value="limited">Limited</option>
              <option value="exhausted">Exhausted</option>
            </select>
          </Field>
        </div>

        <Field label="Category tags">
          <div className="flex gap-2">
            <input
              className="input flex-1"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addTag()
                }
              }}
              placeholder="coding, research… + Enter"
            />
            <button type="button" onClick={addTag} className="btn-secondary">
              Add
            </button>
          </div>
          {form.category_tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {form.category_tags.map((tag) => (
                <TagBadge
                  key={tag}
                  tag={tag}
                  onRemove={() => setField('category_tags', form.category_tags.filter((t) => t !== tag))}
                />
              ))}
            </div>
          )}
        </Field>

        <Field label="Notes">
          <textarea
            className="input min-h-[72px] resize-none"
            value={form.notes}
            onChange={(e) => setField('notes', e.target.value)}
          />
        </Field>

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary">{isEdit ? 'Save changes' : 'Add account'}</button>
        </div>
      </form>
    </Modal>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-500">{label}</label>
      {children}
    </div>
  )
}
