import { LayoutDashboard, Bot, FolderKanban, Lightbulb } from 'lucide-react'
import type { Page } from '../../App'

interface Props {
  activePage: Page
  setActivePage: (page: Page) => void
}

const nav: { page: Page; label: string; Icon: React.ElementType; activeColor: string }[] = [
  { page: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard, activeColor: 'text-white' },
  { page: 'accounts', label: 'Accounts', Icon: Bot, activeColor: 'text-violet-400' },
  { page: 'projects', label: 'Projects', Icon: FolderKanban, activeColor: 'text-orange-400' },
  { page: 'ideas', label: 'Ideas', Icon: Lightbulb, activeColor: 'text-teal-400' },
]

export function Sidebar({ activePage, setActivePage }: Props) {
  return (
    <aside className="w-56 min-h-screen bg-surface border-r border-white/10 flex flex-col p-4 shrink-0">
      <div className="mb-8 px-1">
        <h1 className="text-lg font-bold text-white">AI Tracker</h1>
        <p className="text-xs text-gray-600 mt-0.5">Your AI command centre</p>
      </div>
      <nav className="flex flex-col gap-1">
        {nav.map(({ page, label, Icon, activeColor }) => {
          const active = activePage === page
          return (
            <button
              key={page}
              onClick={() => setActivePage(page)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left
                ${active ? `bg-white/10 ${activeColor}` : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'}`}
            >
              <Icon size={18} className={active ? activeColor : ''} />
              {label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
