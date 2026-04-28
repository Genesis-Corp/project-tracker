import { createClient } from '@supabase/supabase-js'
import {
  Bell,
  Blocks,
  Bot,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Database,
  ExternalLink,
  Flame,
  Gauge,
  Globe2,
  Inbox,
  Laptop,
  Lightbulb,
  Link2,
  ListChecks,
  MonitorSmartphone,
  Plus,
  RefreshCcw,
  Search,
  Sparkles,
  Tag,
  TimerReset,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type AccountStatus = 'Ready' | 'Limited' | 'Exhausted'
type ProjectStatus = 'Inbox' | 'Active' | 'Waiting' | 'Blocked' | 'Done'
type Priority = 'Urgent' | 'High' | 'Medium' | 'Low'
type TaskStatus = 'todo' | 'done'

type Account = {
  id: string
  name: string
  platform: string
  model: string
  login_method: 'Browser' | 'Desktop App' | 'Mobile App'
  browser: string
  device: string
  limit_type: string
  usage_current: number
  usage_limit: number
  reset_at: string
  tags: string[]
  status: AccountStatus
}

type Project = {
  id: string
  name: string
  account_id: string
  continued_from_account_id: string
  status: ProjectStatus
  priority: Priority
  due_date: string
  conversation_url: string
  context_snapshot: string
  tags: string[]
  created_at: string
  updated_at: string
}

type Task = {
  id: string
  project_id: string
  title: string
  status: TaskStatus
  due_date: string
}

type Idea = {
  id: string
  title: string
  body: string
  project_id: string
  tags: string[]
  created_at: string
}

type HistoryItem = {
  id: string
  project_id: string
  label: string
  created_at: string
}

type TrackerData = {
  accounts: Account[]
  projects: Project[]
  tasks: Task[]
  ideas: Idea[]
  history: HistoryItem[]
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

const storageKey = 'ai-project-tracker-data'
const priorityScore: Record<Priority, number> = { Urgent: 4, High: 3, Medium: 2, Low: 1 }

const makeId = () => crypto.randomUUID()
const nowIso = () => new Date().toISOString()
const inHours = (hours: number) => new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
const todayPlus = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
const tagsFrom = (value: string) =>
  value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)

const seedData: TrackerData = {
  accounts: [
    {
      id: 'acc-claude-browser',
      name: 'Claude Main',
      platform: 'Claude',
      model: 'Claude Sonnet',
      login_method: 'Browser',
      browser: 'Chrome',
      device: 'Desktop',
      limit_type: 'Rolling messages',
      usage_current: 34,
      usage_limit: 45,
      reset_at: inHours(2.4),
      tags: ['coding', 'planning'],
      status: 'Limited',
    },
    {
      id: 'acc-chatgpt-app',
      name: 'ChatGPT Plus',
      platform: 'OpenAI',
      model: 'GPT-5',
      login_method: 'Desktop App',
      browser: 'App',
      device: 'Laptop',
      limit_type: 'Daily',
      usage_current: 12,
      usage_limit: 80,
      reset_at: inHours(9),
      tags: ['research', 'writing'],
      status: 'Ready',
    },
  ],
  projects: [
    {
      id: 'proj-tracker',
      name: 'AI Account Command Centre',
      account_id: 'acc-claude-browser',
      continued_from_account_id: '',
      status: 'Active',
      priority: 'Urgent',
      due_date: todayPlus(2),
      conversation_url: '',
      context_snapshot:
        'Build a personal tracker for AI accounts, reset timers, projects, tasks, ideas, and context snapshots.',
      tags: ['productivity', 'app-build'],
      created_at: nowIso(),
      updated_at: nowIso(),
    },
    {
      id: 'proj-market-map',
      name: 'Market research sweep',
      account_id: 'acc-chatgpt-app',
      continued_from_account_id: 'acc-claude-browser',
      status: 'Waiting',
      priority: 'High',
      due_date: todayPlus(5),
      conversation_url: '',
      context_snapshot: 'Waiting for reset before expanding competitor notes into structured findings.',
      tags: ['research'],
      created_at: nowIso(),
      updated_at: nowIso(),
    },
  ],
  tasks: [
    { id: 'task-1', project_id: 'proj-tracker', title: 'Create Supabase schema', status: 'done', due_date: todayPlus(0) },
    { id: 'task-2', project_id: 'proj-tracker', title: 'Add live reset countdowns', status: 'todo', due_date: todayPlus(1) },
    { id: 'task-3', project_id: 'proj-market-map', title: 'Summarise source links', status: 'todo', due_date: todayPlus(4) },
  ],
  ideas: [
    {
      id: 'idea-1',
      title: 'Add a stalled-project nudge',
      body: 'Surface projects untouched for 48 hours so they do not disappear.',
      project_id: 'proj-tracker',
      tags: ['automation'],
      created_at: nowIso(),
    },
  ],
  history: [
    { id: 'history-1', project_id: 'proj-tracker', label: 'Project created from planning notes', created_at: nowIso() },
  ],
}

async function loadData(): Promise<{ data: TrackerData; source: 'Supabase' | 'Local demo' }> {
  const local = localStorage.getItem(storageKey)
  if (!supabase) {
    return { data: local ? JSON.parse(local) : seedData, source: 'Local demo' }
  }

  const [accounts, projects, tasks, ideas, history] = await Promise.all([
    supabase.from('accounts').select('*').order('name'),
    supabase.from('projects').select('*').order('updated_at', { ascending: false }),
    supabase.from('tasks').select('*').order('due_date', { ascending: true }),
    supabase.from('ideas').select('*').order('created_at', { ascending: false }),
    supabase.from('status_history').select('*').order('created_at', { ascending: false }),
  ])

  if (accounts.error || projects.error || tasks.error || ideas.error || history.error) {
    console.warn('Supabase load failed, using local data instead.')
    return { data: local ? JSON.parse(local) : seedData, source: 'Local demo' }
  }

  return {
    data: {
      accounts: accounts.data ?? [],
      projects: projects.data ?? [],
      tasks: tasks.data ?? [],
      ideas: ideas.data ?? [],
      history: history.data ?? [],
    },
    source: 'Supabase',
  }
}

async function syncData(data: TrackerData) {
  localStorage.setItem(storageKey, JSON.stringify(data))
  if (!supabase) return

  await Promise.all([
    data.accounts.length ? supabase.from('accounts').upsert(data.accounts) : Promise.resolve(),
    data.projects.length ? supabase.from('projects').upsert(data.projects) : Promise.resolve(),
    data.tasks.length ? supabase.from('tasks').upsert(data.tasks) : Promise.resolve(),
    data.ideas.length ? supabase.from('ideas').upsert(data.ideas) : Promise.resolve(),
    data.history.length ? supabase.from('status_history').upsert(data.history) : Promise.resolve(),
  ])
}

function countdown(resetAt: string, tick: number) {
  if (!resetAt) return 'No reset set'
  const diff = new Date(resetAt).getTime() - tick
  if (Number.isNaN(diff)) return 'Invalid reset'
  if (diff <= 0) return 'Ready now'
  const totalSeconds = Math.floor(diff / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${hours}h ${minutes}m ${seconds}s`
}

function formatShortDate(value: string) {
  if (!value) return 'No date'
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(value))
}

function App() {
  const [data, setData] = useState<TrackerData>(seedData)
  const [source, setSource] = useState<'Supabase' | 'Local demo'>('Local demo')
  const [activeView, setActiveView] = useState('Dashboard')
  const [query, setQuery] = useState('')
  const [tick, setTick] = useState(() => Date.now())
  const [newTaskTitle, setNewTaskTitle] = useState<Record<string, string>>({})

  useEffect(() => {
    loadData().then((loaded) => {
      setData(loaded.data)
      setSource(loaded.source)
    })
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => setTick(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const updateData = (next: TrackerData) => {
    setData(next)
    void syncData(next)
  }

  const accountsById = useMemo(
    () => Object.fromEntries(data.accounts.map((account) => [account.id, account])),
    [data.accounts],
  )

  const filteredProjects = useMemo(() => {
    const needle = query.toLowerCase()
    return data.projects
      .filter((project) => {
        const account = accountsById[project.account_id]
        return [project.name, project.context_snapshot, project.tags.join(' '), account?.name ?? '']
          .join(' ')
          .toLowerCase()
          .includes(needle)
      })
      .sort((a, b) => priorityScore[b.priority] - priorityScore[a.priority])
  }, [accountsById, data.projects, query])

  const activeProjects = data.projects.filter((project) => !['Done'].includes(project.status))
  const exhaustedAccounts = data.accounts.filter((account) => account.status === 'Exhausted').length
  const waitingProjects = data.projects.filter((project) => project.status === 'Waiting').length
  const globalIdeas = data.ideas.filter((idea) => !idea.project_id).length

  const addAccount = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const nextAccount: Account = {
      id: makeId(),
      name: String(form.get('name')),
      platform: String(form.get('platform')),
      model: String(form.get('model')),
      login_method: String(form.get('login_method')) as Account['login_method'],
      browser: String(form.get('browser')),
      device: String(form.get('device')),
      limit_type: String(form.get('limit_type')),
      usage_current: Number(form.get('usage_current')),
      usage_limit: Number(form.get('usage_limit')),
      reset_at: String(form.get('reset_at')) ? new Date(String(form.get('reset_at'))).toISOString() : '',
      tags: tagsFrom(String(form.get('tags'))),
      status: String(form.get('status')) as AccountStatus,
    }
    updateData({ ...data, accounts: [nextAccount, ...data.accounts] })
    event.currentTarget.reset()
  }

  const addProject = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const project: Project = {
      id: makeId(),
      name: String(form.get('name')),
      account_id: String(form.get('account_id')),
      continued_from_account_id: String(form.get('continued_from_account_id')),
      status: String(form.get('status')) as ProjectStatus,
      priority: String(form.get('priority')) as Priority,
      due_date: String(form.get('due_date')),
      conversation_url: String(form.get('conversation_url')),
      context_snapshot: String(form.get('context_snapshot')),
      tags: tagsFrom(String(form.get('tags'))),
      created_at: nowIso(),
      updated_at: nowIso(),
    }
    updateData({
      ...data,
      projects: [project, ...data.projects],
      history: [
        { id: makeId(), project_id: project.id, label: `Created as ${project.status}`, created_at: nowIso() },
        ...data.history,
      ],
    })
    event.currentTarget.reset()
  }

  const addIdea = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const idea: Idea = {
      id: makeId(),
      title: String(form.get('title')),
      body: String(form.get('body')),
      project_id: String(form.get('project_id')),
      tags: tagsFrom(String(form.get('tags'))),
      created_at: nowIso(),
    }
    updateData({ ...data, ideas: [idea, ...data.ideas] })
    event.currentTarget.reset()
  }

  const changeProjectStatus = (projectId: string, status: ProjectStatus) => {
    const project = data.projects.find((item) => item.id === projectId)
    if (!project || project.status === status) return
    updateData({
      ...data,
      projects: data.projects.map((item) =>
        item.id === projectId ? { ...item, status, updated_at: nowIso() } : item,
      ),
      history: [
        { id: makeId(), project_id: projectId, label: `Moved from ${project.status} to ${status}`, created_at: nowIso() },
        ...data.history,
      ],
    })
  }

  const addTask = (projectId: string) => {
    const title = newTaskTitle[projectId]?.trim()
    if (!title) return
    updateData({
      ...data,
      tasks: [{ id: makeId(), project_id: projectId, title, status: 'todo', due_date: '' }, ...data.tasks],
    })
    setNewTaskTitle({ ...newTaskTitle, [projectId]: '' })
  }

  const toggleTask = (taskId: string) => {
    updateData({
      ...data,
      tasks: data.tasks.map((task) =>
        task.id === taskId ? { ...task, status: task.status === 'done' ? 'todo' : 'done' } : task,
      ),
    })
  }

  const promoteIdea = (idea: Idea) => {
    const fallbackAccount = data.accounts[0]?.id ?? ''
    const project: Project = {
      id: makeId(),
      name: idea.title,
      account_id: fallbackAccount,
      continued_from_account_id: '',
      status: 'Inbox',
      priority: 'Medium',
      due_date: '',
      conversation_url: '',
      context_snapshot: idea.body,
      tags: idea.tags,
      created_at: nowIso(),
      updated_at: nowIso(),
    }
    updateData({
      ...data,
      projects: [project, ...data.projects],
      ideas: data.ideas.filter((item) => item.id !== idea.id),
      history: [{ id: makeId(), project_id: project.id, label: 'Promoted from idea queue', created_at: nowIso() }, ...data.history],
    })
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark">
          <Sparkles size={22} />
          <div>
            <span>AI Ops</span>
            <strong>Command Centre</strong>
          </div>
        </div>
        <nav>
          {[
            ['Dashboard', Gauge],
            ['Accounts', Bot],
            ['Projects', Blocks],
            ['Ideas', Lightbulb],
            ['Settings', Database],
          ].map(([label, Icon]) => (
            <button
              className={activeView === label ? 'active' : ''}
              key={String(label)}
              onClick={() => setActiveView(String(label))}
              type="button"
            >
              <Icon size={18} />
              {String(label)}
            </button>
          ))}
        </nav>
        <div className="sync-panel">
          <Database size={18} />
          <div>
            <span>Data source</span>
            <strong>{source}</strong>
          </div>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Personal AI project tracker</p>
            <h1>Keep every account, reset, and loose thread visible.</h1>
          </div>
          <label className="searchbox">
            <Search size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects, tags, accounts" />
          </label>
        </header>

        {activeView === 'Dashboard' && (
          <>
            <section className="stat-grid">
              <Metric icon={Bot} label="Accounts" value={data.accounts.length} tone="cyan" />
              <Metric icon={Blocks} label="Open projects" value={activeProjects.length} tone="orange" />
              <Metric icon={TimerReset} label="Waiting on reset" value={waitingProjects + exhaustedAccounts} tone="pink" />
              <Metric icon={Lightbulb} label="Global ideas" value={globalIdeas} tone="green" />
            </section>

            <section className="split-layout">
              <div className="panel">
                <PanelTitle icon={Clock3} title="Reset Radar" subtitle="Live countdowns for every account." />
                <div className="account-list">
                  {data.accounts.map((account) => (
                    <AccountCard account={account} key={account.id} tick={tick} />
                  ))}
                </div>
              </div>

              <div className="panel">
                <PanelTitle icon={Flame} title="Priority Lane" subtitle="Sorted by urgency so stalled work is obvious." />
                <div className="project-list compact">
                  {filteredProjects.slice(0, 5).map((project) => (
                    <ProjectCard
                      accountsById={accountsById}
                      data={data}
                      key={project.id}
                      onAddTask={addTask}
                      onStatusChange={changeProjectStatus}
                      onTaskInput={setNewTaskTitle}
                      onToggleTask={toggleTask}
                      project={project}
                      taskDrafts={newTaskTitle}
                    />
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {activeView === 'Accounts' && (
          <section className="split-layout wide-left">
            <div className="panel">
              <PanelTitle icon={Bot} title="Accounts" subtitle="Track model, device, browser, limits, and reset time." />
              <div className="account-list">
                {data.accounts.map((account) => (
                  <AccountCard account={account} key={account.id} tick={tick} />
                ))}
              </div>
            </div>
            <form className="panel form-grid" onSubmit={addAccount}>
              <PanelTitle icon={Plus} title="Add Account" subtitle="Use exact browser/device notes so you know where to return." />
              <input name="name" placeholder="Account name" required />
              <input name="platform" placeholder="Platform, e.g. Claude" required />
              <input name="model" placeholder="Model used" required />
              <select name="login_method" defaultValue="Browser">
                <option>Browser</option>
                <option>Desktop App</option>
                <option>Mobile App</option>
              </select>
              <input name="browser" placeholder="Browser or app" />
              <input name="device" placeholder="Device" />
              <input name="limit_type" placeholder="Limit type" />
              <div className="inline-fields">
                <input name="usage_current" type="number" min="0" defaultValue="0" aria-label="Current usage" />
                <input name="usage_limit" type="number" min="1" defaultValue="50" aria-label="Usage limit" />
              </div>
              <input name="reset_at" type="datetime-local" />
              <select name="status" defaultValue="Ready">
                <option>Ready</option>
                <option>Limited</option>
                <option>Exhausted</option>
              </select>
              <input name="tags" placeholder="Tags, comma separated" />
              <button type="submit">
                <Plus size={17} /> Add account
              </button>
            </form>
          </section>
        )}

        {activeView === 'Projects' && (
          <section className="split-layout wide-left">
            <div className="panel">
              <PanelTitle icon={Blocks} title="Projects" subtitle="Each project keeps its account, context, links, tasks, and history." />
              <div className="project-list">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    accountsById={accountsById}
                    data={data}
                    key={project.id}
                    onAddTask={addTask}
                    onStatusChange={changeProjectStatus}
                    onTaskInput={setNewTaskTitle}
                    onToggleTask={toggleTask}
                    project={project}
                    taskDrafts={newTaskTitle}
                  />
                ))}
              </div>
            </div>
            <form className="panel form-grid" onSubmit={addProject}>
              <PanelTitle icon={Plus} title="New Project" subtitle="Save enough context to resume after limits reset." />
              <input name="name" placeholder="Project name" required />
              <select name="account_id" required>
                <option value="">Linked account</option>
                {data.accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
              <select name="continued_from_account_id">
                <option value="">Continued from account</option>
                {data.accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
              <div className="inline-fields">
                <select name="status" defaultValue="Active">
                  <option>Inbox</option>
                  <option>Active</option>
                  <option>Waiting</option>
                  <option>Blocked</option>
                  <option>Done</option>
                </select>
                <select name="priority" defaultValue="Medium">
                  <option>Urgent</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
              <input name="due_date" type="date" />
              <input name="conversation_url" type="url" placeholder="Conversation URL" />
              <textarea name="context_snapshot" placeholder="Where did the conversation leave off?" rows={5} />
              <input name="tags" placeholder="Tags, comma separated" />
              <button type="submit">
                <Plus size={17} /> Add project
              </button>
            </form>
          </section>
        )}

        {activeView === 'Ideas' && (
          <section className="split-layout wide-left">
            <div className="panel">
              <PanelTitle icon={Inbox} title="Ideas Queue" subtitle="Global by default, or linked to a project when relevant." />
              <div className="idea-list">
                {data.ideas.map((idea) => (
                  <article className="idea-card" key={idea.id}>
                    <div>
                      <h3>{idea.title}</h3>
                      <p>{idea.body}</p>
                      <div className="tag-row">
                        {idea.project_id && <Badge icon={Link2} text={data.projects.find((project) => project.id === idea.project_id)?.name ?? 'Linked'} />}
                        {idea.tags.map((tag) => (
                          <Badge icon={Tag} key={tag} text={tag} />
                        ))}
                      </div>
                    </div>
                    <button className="ghost-button" onClick={() => promoteIdea(idea)} type="button">
                      Promote <ChevronRight size={16} />
                    </button>
                  </article>
                ))}
              </div>
            </div>
            <form className="panel form-grid" onSubmit={addIdea}>
              <PanelTitle icon={Lightbulb} title="Quick Capture" subtitle="Dump the thought now; sort it later." />
              <input name="title" placeholder="Idea title" required />
              <textarea name="body" placeholder="Notes" rows={6} />
              <select name="project_id">
                <option value="">Global idea</option>
                {data.projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              <input name="tags" placeholder="Tags, comma separated" />
              <button type="submit">
                <Plus size={17} /> Save idea
              </button>
            </form>
          </section>
        )}

        {activeView === 'Settings' && (
          <section className="panel settings">
            <PanelTitle icon={Database} title="Supabase Setup" subtitle="Use local demo data now, then move to Supabase when credentials are ready." />
            <div className="setup-grid">
              <div>
                <h3>1. Create your Supabase project</h3>
                <p>Open Supabase, create a new project, then run the SQL in <code>supabase/schema.sql</code>.</p>
              </div>
              <div>
                <h3>2. Add environment keys</h3>
                <p>Copy <code>.env.example</code> to <code>.env</code> and fill in <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>.</p>
              </div>
              <div>
                <h3>3. Restart the dev server</h3>
                <p>The badge in the sidebar will switch from Local demo to Supabase after a successful load.</p>
              </div>
            </div>
          </section>
        )}
      </section>
    </main>
  )
}

function Metric({ icon: Icon, label, value, tone }: { icon: typeof Bot; label: string; value: number; tone: string }) {
  return (
    <article className={`metric ${tone}`}>
      <Icon size={21} />
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </article>
  )
}

function PanelTitle({ icon: Icon, title, subtitle }: { icon: typeof Bot; title: string; subtitle: string }) {
  return (
    <div className="panel-title">
      <Icon size={20} />
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    </div>
  )
}

function Badge({ icon: Icon, text }: { icon: typeof Tag; text: string }) {
  return (
    <span className="badge">
      <Icon size={13} />
      {text}
    </span>
  )
}

function AccountCard({ account, tick }: { account: Account; tick: number }) {
  const percent = account.usage_limit ? Math.min(100, Math.round((account.usage_current / account.usage_limit) * 100)) : 0

  return (
    <article className="account-card">
      <div className="card-head">
        <div>
          <span className={`status-dot ${account.status.toLowerCase()}`}>{account.status}</span>
          <h3>{account.name}</h3>
        </div>
        <strong>{account.platform}</strong>
      </div>
      <div className="usage-bar">
        <span style={{ width: `${percent}%` }} />
      </div>
      <div className="meta-grid">
        <Badge icon={Bot} text={account.model} />
        <Badge icon={MonitorSmartphone} text={account.login_method} />
        <Badge icon={Globe2} text={account.browser || 'No browser'} />
        <Badge icon={Laptop} text={account.device || 'No device'} />
        <Badge icon={RefreshCcw} text={`${account.usage_current}/${account.usage_limit} ${account.limit_type}`} />
        <Badge icon={TimerReset} text={countdown(account.reset_at, tick)} />
      </div>
    </article>
  )
}

function ProjectCard({
  accountsById,
  data,
  onAddTask,
  onStatusChange,
  onTaskInput,
  onToggleTask,
  project,
  taskDrafts,
}: {
  accountsById: Record<string, Account>
  data: TrackerData
  onAddTask: (projectId: string) => void
  onStatusChange: (projectId: string, status: ProjectStatus) => void
  onTaskInput: (drafts: Record<string, string>) => void
  onToggleTask: (taskId: string) => void
  project: Project
  taskDrafts: Record<string, string>
}) {
  const tasks = data.tasks.filter((task) => task.project_id === project.id)
  const history = data.history.filter((item) => item.project_id === project.id).slice(0, 2)
  const completed = tasks.filter((task) => task.status === 'done').length

  return (
    <article className="project-card">
      <div className="project-head">
        <div>
          <div className="tag-row">
            <span className={`priority ${project.priority.toLowerCase()}`}>{project.priority}</span>
            <span className="badge">{project.status}</span>
          </div>
          <h3>{project.name}</h3>
        </div>
        <select value={project.status} onChange={(event) => onStatusChange(project.id, event.target.value as ProjectStatus)} aria-label="Project status">
          <option>Inbox</option>
          <option>Active</option>
          <option>Waiting</option>
          <option>Blocked</option>
          <option>Done</option>
        </select>
      </div>

      <p className="snapshot">{project.context_snapshot}</p>

      <div className="tag-row">
        <Badge icon={Bot} text={accountsById[project.account_id]?.name ?? 'No account'} />
        {project.continued_from_account_id && <Badge icon={Link2} text={`Continued from ${accountsById[project.continued_from_account_id]?.name ?? 'account'}`} />}
        <Badge icon={CalendarClock} text={formatShortDate(project.due_date)} />
        <Badge icon={ListChecks} text={`${completed}/${tasks.length} tasks`} />
        {project.conversation_url && (
          <a className="badge link-badge" href={project.conversation_url} target="_blank">
            <ExternalLink size={13} /> Chat
          </a>
        )}
      </div>

      <div className="task-stack">
        {tasks.map((task) => (
          <button className={`task-row ${task.status}`} key={task.id} onClick={() => onToggleTask(task.id)} type="button">
            <CheckCircle2 size={16} />
            <span>{task.title}</span>
          </button>
        ))}
        <div className="add-task-row">
          <input
            placeholder="Add task"
            value={taskDrafts[project.id] ?? ''}
            onChange={(event) => onTaskInput({ ...taskDrafts, [project.id]: event.target.value })}
            onKeyDown={(event) => {
              if (event.key === 'Enter') onAddTask(project.id)
            }}
          />
          <button onClick={() => onAddTask(project.id)} type="button">
            <Plus size={16} />
          </button>
        </div>
      </div>

      {history.length > 0 && (
        <div className="history-line">
          <Bell size={14} />
          {history.map((item) => (
            <span key={item.id}>{item.label}</span>
          ))}
        </div>
      )}
    </article>
  )
}

export default App
