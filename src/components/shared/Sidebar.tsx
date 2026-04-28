import { LayoutDashboard, Bot, FolderKanban, Lightbulb } from 'lucide-react';

interface Props {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, activeColor: 'text-blue-400' },
  { id: 'accounts', label: 'Accounts', icon: Bot, activeColor: 'text-emerald-400' },
  { id: 'projects', label: 'Projects', icon: FolderKanban, activeColor: 'text-orange-400' },
  { id: 'ideas', label: 'Ideas', icon: Lightbulb, activeColor: 'text-yellow-400' },
];

export default function Sidebar({ currentPage, onPageChange }: Props) {
  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 p-4 flex flex-col">
      <h1 className="text-xl font-bold text-white mb-8">AI Project Tracker</h1>
      <nav className="space-y-2 flex-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon, activeColor }) => (
          <button
            key={id}
            onClick={() => onPageChange(id)}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              currentPage === id
                ? `${activeColor} bg-gray-800`
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="pt-4 border-t border-gray-800 text-xs text-gray-500">
        v1.0.0
      </div>
    </aside>
  );
}
