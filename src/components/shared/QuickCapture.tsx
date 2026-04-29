import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Modal } from './Modal'
import { useAccountStore } from '../../store/accountStore'
import { useProjectStore } from '../../store/projectStore'
import { useIdeaStore } from '../../store/ideaStore'

type CaptureType = 'idea' | 'project'

export function QuickCapture() {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<CaptureType>('idea')
  const [title, setTitle] = useState('')
  const [accountId, setAccountId] = useState('')
  const { accounts } = useAccountStore()
  const { add: addProject } = useProjectStore()
  const { add: addIdea } = useIdeaStore()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    if (type === 'idea') {
      await addIdea({ title: title.trim(), body: null, project_id: null, tags: [] })
    } else {
      await addProject({
        name: title.trim(),
        account_id: accountId,
        status: 'active',
        priority: 'medium',
        due_date: null,
        conversation_url: null,
        continued_from_project_id: null,
        context_snapshot: null,
        domain_tags: [],
        model: '',
      })
    }

    setTitle('')
    setAccountId('')
    setOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Quick capture"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-teal-600 text-white shadow-xl hover:scale-110 active:scale-95 transition-transform flex items-center justify-center z-30"
      >
        <Plus size={22} />
      </button>

      {open && (
        <Modal title="Quick capture" onClose={() => setOpen(false)} size="sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              {(['idea', 'project'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${
                    type === t ? 'bg-violet-600 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === 'idea' ? "What's the idea?" : 'Project name?'}
              autoFocus
              required
            />

            {type === 'project' && (
              <select
                className="input"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                required
              >
                <option value="">Select account…</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            )}

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Capture</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}
