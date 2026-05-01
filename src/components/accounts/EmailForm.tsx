import { useState } from 'react'
import type { EmailIdentity } from '../../types'
import { Modal } from '../shared/Modal'
import { useEmailStore } from '../../store/emailStore'

type FormData = Omit<EmailIdentity, 'id' | 'created_at' | 'updated_at'>

const defaultForm: FormData = { email: '', label: '', notes: '' }

interface Props {
  emailIdentity?: EmailIdentity
  onClose: () => void
}

export function EmailForm({ emailIdentity, onClose }: Props) {
  const { add, update } = useEmailStore()
  const [form, setForm] = useState<FormData>(
    emailIdentity
      ? { email: emailIdentity.email, label: emailIdentity.label, notes: emailIdentity.notes }
      : defaultForm
  )
  const [error, setError] = useState<string | null>(null)
  const isEdit = Boolean(emailIdentity)

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      if (isEdit && emailIdentity) {
        await update(emailIdentity.id, form)
      } else {
        await add(form)
      }
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : (err as { message?: string })?.message
      setError(msg ?? 'Unknown error')
    }
  }

  return (
    <Modal title={isEdit ? 'Edit Email' : 'Add Email'} onClose={onClose} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Email address *">
          <input
            className="input"
            type="email"
            value={form.email}
            onChange={(e) => setField('email', e.target.value)}
            placeholder="you@example.com"
            required
          />
        </Field>
        <Field label="Label">
          <input
            className="input"
            value={form.label}
            onChange={(e) => setField('label', e.target.value)}
            placeholder="Personal, Work, Client…"
          />
        </Field>
        <Field label="Notes">
          <textarea
            className="input min-h-[72px] resize-none"
            value={form.notes}
            onChange={(e) => setField('notes', e.target.value)}
          />
        </Field>

        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary">{isEdit ? 'Save changes' : 'Add email'}</button>
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
