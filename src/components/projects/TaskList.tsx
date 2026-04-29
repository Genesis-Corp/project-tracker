import { useState } from 'react'
import { Plus, Trash2, CheckCircle2, Circle, Timer } from 'lucide-react'
import type { Task, TaskStatus } from '../../types'
import { useProjectStore } from '../../store/projectStore'

interface Props {
  projectId: string
  tasks: Task[]
}

const nextStatus: Record<TaskStatus, TaskStatus> = {
  todo: 'in_progress',
  in_progress: 'done',
  done: 'todo',
}

function StatusIcon({ status }: { status: TaskStatus }) {
  if (status === 'done') return <CheckCircle2 size={15} className="text-green-400" />
  if (status === 'in_progress') return <Timer size={15} className="text-amber-400" />
  return <Circle size={15} className="text-gray-600" />
}

export function TaskList({ projectId, tasks }: Props) {
  const { addTask, updateTask, removeTask } = useProjectStore()
  const [newTitle, setNewTitle] = useState('')

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    await addTask({
      project_id: projectId,
      title: newTitle.trim(),
      status: 'todo',
      due_date: null,
      sort_order: tasks.length,
    })
    setNewTitle('')
  }

  return (
    <div className="space-y-1.5">
      {tasks.map((task) => (
        <div key={task.id} className="flex items-center gap-2.5 group py-0.5">
          <button
            onClick={() => updateTask(task.id, { status: nextStatus[task.status] })}
            aria-label="Toggle task status"
            className="shrink-0 transition-opacity"
          >
            <StatusIcon status={task.status} />
          </button>
          <span
            className={`flex-1 text-sm ${
              task.status === 'done' ? 'line-through text-gray-600' : 'text-gray-200'
            }`}
          >
            {task.title}
          </span>
          <button
            onClick={() => removeTask(task.id, projectId)}
            aria-label="Delete task"
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-gray-600 hover:text-red-400 transition-all"
          >
            <Trash2 size={11} />
          </button>
        </div>
      ))}

      <form onSubmit={handleAdd} className="flex items-center gap-2 pt-1">
        <input
          className="input flex-1 py-1.5 text-xs"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a task…"
        />
        <button
          type="submit"
          aria-label="Add task"
          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-colors"
        >
          <Plus size={14} />
        </button>
      </form>
    </div>
  )
}
