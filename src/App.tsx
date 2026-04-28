import { useState } from 'react'
import { Sidebar } from './components/shared/Sidebar'
import { Dashboard } from './pages/Dashboard'
import { Accounts } from './pages/Accounts'
import { Projects } from './pages/Projects'
import { Ideas } from './pages/Ideas'

export type Page = 'dashboard' | 'accounts' | 'projects' | 'ideas'

export default function App() {
  const [activePage, setActivePage] = useState<Page>('dashboard')

  const pages: Record<Page, React.ReactNode> = {
    dashboard: <Dashboard />,
    accounts: <Accounts />,
    projects: <Projects />,
    ideas: <Ideas />,
  }

  return (
    <div className="flex min-h-screen bg-bg text-white">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="flex-1 p-6 overflow-auto min-h-screen">
        {pages[activePage]}
      </main>
    </div>
  )
}
