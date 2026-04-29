import { Bot, FolderKanban, CheckSquare, Lightbulb } from 'lucide-react'

interface Props {
  readyAccounts: number
  activeProjects: number
  openTasks: number
  totalIdeas: number
}

export function StatsBar({ readyAccounts, activeProjects, openTasks, totalIdeas }: Props) {
  const stats = [
    { label: 'Accounts ready', value: readyAccounts, Icon: Bot, color: 'text-violet-400' },
    { label: 'Active projects', value: activeProjects, Icon: FolderKanban, color: 'text-orange-400' },
    { label: 'Open tasks', value: openTasks, Icon: CheckSquare, color: 'text-amber-400' },
    { label: 'Ideas', value: totalIdeas, Icon: Lightbulb, color: 'text-teal-400' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map(({ label, value, Icon, color }) => (
        <div key={label} className="card flex items-center gap-3">
          <Icon size={20} className={color} />
          <div>
            <p className="text-2xl font-bold text-white leading-none">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
