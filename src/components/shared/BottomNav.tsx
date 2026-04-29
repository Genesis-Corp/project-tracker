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

export function BottomNav({ activePage, setActivePage }: Props) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-surface border-t border-white/10 flex">
      {nav.map(({ page, label, Icon, activeColor }) => {
        const active = activePage === page
        return (
          <button
            key={page}
            onClick={() => setActivePage(page)}
            aria-current={active ? 'page' : undefined}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors
              ${active ? activeColor : 'text-gray-600'}`}
          >
            <Icon size={20} />
            {label}
          </button>
        )
      })}
    </nav>
  )
}
