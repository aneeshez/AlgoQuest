import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Activity, ArrowRight, Award, BookOpen, BrainCircuit, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Code2, Compass, Flame, Gamepad2, GitBranch, LockKeyhole, Menu, Search, ShieldCheck, Sparkles, Trophy, X, Zap } from 'lucide-react'
import { api } from '../lib/api.js'
import AuthDialog from '../components/AuthDialog.jsx'
import LessonPage from '../features/LessonPage.jsx'
import { buildSortTrace } from '../features/sorting.js'
import GameHub from '../features/GameHub.jsx'
import CodingArena from '../features/CodingArena.jsx'
import LandingPage from '../features/LandingPage.jsx'

const nav = [
  { name: 'Home base', icon: Compass }, { name: 'Learning path', icon: GitBranch }, { name: 'Leaderboard', icon: Trophy }, { name: 'Coding arena', icon: Code2 }, { name: 'Mini-games', icon: Gamepad2 },
]
const initial = [12, 7, 18, 5, 14, 9]

function App() {
  const [active, setActive] = useState('Landing')
  const [collapsed, setCollapsed] = useState(() => window.innerWidth <= 780)
  const [sort, setSort] = useState('Bubble sort')
  const [numbers, setNumbers] = useState(initial)
  const [sortStep, setSortStep] = useState(0)
  const [notice, setNotice] = useState('')
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [authError, setAuthError] = useState('')
  const [authBusy, setAuthBusy] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [account, setAccount] = useState(null)
  const [apiModules, setApiModules] = useState([])
  const [curriculumLoading, setCurriculumLoading] = useState(true)
  const [curriculumError, setCurriculumError] = useState('')
  const [selectedLesson, setSelectedLesson] = useState('')
  const [leaderboard, setLeaderboard] = useState(null)
  const [leaderboardLoading, setLeaderboardLoading] = useState(false)
  const [leaderboardError, setLeaderboardError] = useState('')

  useEffect(() => {
    api.me().then((data) => { setAccount(data); if (data.authenticated) setActive('Home base') }).catch(() => {})
    loadCurriculum()
  }, [])
  useEffect(() => {
    if (active !== 'Leaderboard') return
    setLeaderboardLoading(true); setLeaderboardError('')
    api.leaderboard().then(setLeaderboard).catch((error) => setLeaderboardError(error.message)).finally(() => setLeaderboardLoading(false))
  }, [active])
  const loadCurriculum = async () => {
    setCurriculumLoading(true); setCurriculumError('')
    try { const data = await api.modules(); setApiModules(data.results || data) }
    catch (error) { setCurriculumError(error.message) }
    finally { setCurriculumLoading(false) }
  }
  useEffect(() => {
    const onKeyDown = (event) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setSearchOpen(true) } }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const submitAuth = async (mode, form) => {
    setAuthBusy(true); setAuthError('')
    try {
      const data = await api.auth(mode === 'register' ? 'register' : 'login', form)
      setAccount(data); setAuthOpen(false); setActive('Home base')
      loadCurriculum()
      showNotice(`Welcome${mode === 'register' ? ' to AlgoQuest' : ' back'}, ${data.user.username}.`)
    } catch (error) { setAuthError(error.message) }
    finally { setAuthBusy(false) }
  }
  const saveNickname = async (nickname) => {
    const data = await api.updateProfile({ nickname })
    setAccount((current) => current ? { ...current, profile: { ...current.profile, nickname: data.nickname } } : current)
    showNotice('Your public nickname has been updated.')
  }
  const signOut = async () => {
    try { await api.auth('logout'); setAccount(null); setActive('Landing'); loadCurriculum(); showNotice('You are signed out.') }
    catch { showNotice('Could not sign out. Please try again.') }
  }
  const navigate = (name) => { if (name === 'Home base' && !account?.authenticated) { setAuthMode('login'); setAuthOpen(true); return } setActive(name); if (window.innerWidth <= 780) setCollapsed(true) }
  const openRegister = () => { setAuthMode('register'); setAuthError(''); setAuthOpen(true) }
  const openLogin = () => { setAuthMode('login'); setAuthError(''); setAuthOpen(true) }
  const openLesson = (lesson) => { if (!lesson) return; setSelectedLesson(lesson.slug); navigate('Lesson') }

  const showNotice = (text) => { setNotice(text); window.setTimeout(() => setNotice(''), 2800) }
  const trace = useMemo(() => buildSortTrace(numbers, sort), [numbers, sort])
  const frame = sortStep === 0 ? { values: numbers, comparisons: 0, swaps: 0, pair: [] } : trace[Math.min(sortStep - 1, trace.length - 1)]
  const nextSortStep = () => setSortStep((n) => Math.min(n + 1, trace.length))
  const randomize = () => { setNumbers(Array.from({ length: 6 }, () => Math.floor(Math.random() * 20) + 1)); setSortStep(0) }

  return <div className="min-h-screen bg-[#090d18] text-slate-100">
    <div className="ambient ambient-one" /><div className="ambient ambient-two" />
    <div className={`relative mx-auto flex min-h-screen max-w-[1600px] ${active === 'Landing' ? 'landing-shell' : ''}`}>
      <aside className={`sidebar ${collapsed ? 'sidebar-small' : ''} ${active === 'Landing' ? 'landing-hidden' : ''}`}>
        <div className="brand-row"><div className="brand-mark"><Sparkles size={18} fill="currentColor" /></div>{!collapsed && <div className="brand-name">algo<span>quest</span></div>}<button className="icon-button collapse-button" aria-label="Collapse sidebar" onClick={() => setCollapsed(!collapsed)}><ChevronLeft size={16} /></button></div>
        <div className="profile-card"><div className="avatar">{account?.user?.username?.[0]?.toUpperCase() || 'G'}</div>{!collapsed && <div className="min-w-0"><div className="profile-name">{account?.user?.username || 'Guest explorer'}</div><div className="profile-rank"><span className="rank-dot" /> {account?.authenticated ? `${account.profile.totalXp} XP earned` : 'Guest mode'}</div></div>}{!collapsed && <ChevronDown size={15} className="ml-auto text-slate-500" />}</div>
        {!collapsed && <div className="section-label">YOUR ADVENTURE</div>}
        <nav className="nav-list" aria-label="Main navigation">{nav.map(({ name, icon: Icon }) => <button key={name} onClick={() => navigate(name)} className={`nav-item ${active === name ? 'nav-active' : ''}`} title={collapsed ? name : undefined}><Icon size={17} strokeWidth={1.8} />{!collapsed && <span>{name}</span>}{active === name && <span className="nav-indicator" />}</button>)}</nav>
        {!collapsed && <div className="sidebar-bottom"><button className="quest-card quest-card-action" onClick={() => navigate('Learning path')}><div className="flex items-center justify-between"><span className="text-xs font-semibold text-slate-300">YOUR NEXT STEP</span><ArrowRight size={14} className="text-violet-300" /></div><div className="quest-title">Follow the learning path</div><div className="quest-foot"><span>Ten worlds, one skill at a time</span></div></button><div className="sidebar-version">ALGOQUEST <span>·</span> EARLY ACCESS</div></div>}
      </aside>

      <main className="main-panel">
        {active !== 'Landing' && <header className="topbar"><button className="icon-button mobile-menu" aria-label="Open menu" onClick={() => setCollapsed(!collapsed)}><Menu size={19} /></button><div className="breadcrumbs"><span>Workspace</span><ChevronRight size={14} /><strong>{active}</strong></div><div className="top-actions"><button className="search-button" onClick={() => setSearchOpen(true)}><Search size={15} /><span>Search</span><kbd>⌘ K</kbd></button>{account?.authenticated && <><div className="xp-pill"><Zap size={14} fill="currentColor" /> {account.profile.totalXp} <span>XP</span></div><button className="streak-pill" aria-label={`${account.profile.streakDays} day streak`}><Flame size={16} fill="currentColor" /> {account.profile.streakDays}</button></>}<button className="top-avatar" aria-label={account?.authenticated ? 'Sign out' : 'Sign in'} title={account?.authenticated ? 'Sign out' : 'Sign in'} onClick={() => account?.authenticated ? signOut() : openLogin()}>{account?.user?.username?.[0]?.toUpperCase() || 'G'}</button></div></header>}
        <div className={`content-wrap ${active === 'Landing' ? 'landing-content-wrap' : ''}`}>
          <AnimatePresence mode="wait"><motion.div key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: .2 }}>
            {active === 'Landing' ? <LandingPage onRegister={openRegister} onLogin={openLogin} onPath={() => navigate('Learning path')} onGames={() => navigate('Mini-games')} /> : active === 'Home base' ? <Dashboard account={account} apiModules={apiModules} onNavigate={navigate} onOpenLesson={openLesson} showNotice={showNotice} sort={sort} setSort={(value) => { setSort(value); setSortStep(0) }} numbers={frame.values} sortStep={sortStep} traceLength={trace.length} comparisons={frame.comparisons} swaps={frame.swaps} pair={frame.pair} nextSortStep={nextSortStep} randomize={randomize} /> : active === 'Learning path' ? <Roadmap onSelect={(module) => openLesson(module.lessons.find((lesson) => !lesson.completed) || module.lessons[0])} apiModules={apiModules} loading={curriculumLoading} error={curriculumError} onRetry={loadCurriculum} /> : active === 'Lesson' ? <LessonPage slug={selectedLesson} modules={apiModules} authenticated={!!account?.authenticated} onRequireAuth={openLogin} onNavigateLesson={setSelectedLesson} onBack={() => navigate('Learning path')} onOpenArena={() => navigate('Coding arena')} onComplete={() => { api.me().then(setAccount).catch(() => {}); loadCurriculum() }} /> : active === 'Leaderboard' ? <Leaderboard data={leaderboard} loading={leaderboardLoading} error={leaderboardError} account={account} onSaveNickname={saveNickname} /> : active === 'Mini-games' ? <GameHub /> : active === 'Coding arena' ? <CodingArena authenticated={!!account?.authenticated} onReward={() => api.me().then(setAccount).catch(() => {})} /> : <ComingSoon name={active} onBack={() => navigate('Home base')} />}
          </motion.div></AnimatePresence>
        </div>
      </main>
    </div>
    <AnimatePresence>{notice && <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="toast"><Sparkles size={15} />{notice}<button aria-label="Dismiss" onClick={() => setNotice('')}><X size={14} /></button></motion.div>}</AnimatePresence>
    {authOpen && <AuthDialog key={authMode} initialMode={authMode} onClose={() => setAuthOpen(false)} onSubmit={submitAuth} error={authError} busy={authBusy} />}
    {searchOpen && <SearchDialog modules={apiModules} onClose={() => setSearchOpen(false)} onSelect={(lesson) => { setSearchOpen(false); openLesson(lesson) }} />}
  </div>
}

function Dashboard({ account, apiModules, onNavigate, onOpenLesson, showNotice, sort, setSort, numbers, sortStep, traceLength, comparisons, swaps, pair, nextSortStep, randomize }) {
  const lessons = apiModules.flatMap((module) => module.lessons || [])
  const completeCount = lessons.filter((lesson) => lesson.completed).length
  const currentModule = apiModules.find((module) => module.lessons.some((lesson) => !lesson.completed))
  const nextLesson = currentModule?.lessons.find((lesson) => !lesson.completed)
  const currentLessonProgress = currentModule?.lessons.length ? Math.round((currentModule.lessons.filter((lesson) => lesson.completed).length / currentModule.lessons.length) * 100) : 0
  const totalXp = account?.profile?.totalXp || 0
  const rank = totalXp >= 10000 ? 'DSA Grandmaster' : totalXp >= 5000 ? 'Algorithm Master' : totalXp >= 2500 ? 'Algorithm Knight' : totalXp >= 1000 ? 'Problem Solver' : totalXp >= 300 ? 'Explorer' : 'Beginner'
  const weeklyActivity = account?.profile?.weeklyActivity || []
  const hasActivity = weeklyActivity.some((day) => day.xp > 0)
  return <>
    <div className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-line" /> YOUR ADVENTURE <span className="eyebrow-line" /></div><h1>Your next <span className="gradient-text">great solve</span><br className="desktop-break" /> starts here.</h1><p className="welcome-sub">One small step today. A sharper problem solver tomorrow.</p></div><div className="level-card"><div className="level-emblem"><ShieldCheck size={22} /></div><div><div className="eyebrow">CURRENT RANK</div><div className="level-name">{rank} <span>· {totalXp} XP</span></div></div><ArrowRight size={16} className="ml-auto text-slate-500" /></div></div>
    <div className="stats-grid"><Stat icon={Zap} label="TOTAL EXPERIENCE" value={totalXp.toLocaleString()} suffix="XP" tone="blue" detail="Earned by completing lessons" /><Stat icon={Flame} label="CURRENT STREAK" value={account?.profile?.streakDays || 0} suffix="days" tone="orange" detail={`Best: ${account?.profile?.longestStreak || 0} days`} /><Stat icon={BookOpen} label="LESSONS CLEARED" value={completeCount} suffix={`/ ${lessons.length}`} tone="violet" detail="Across all three sections" /><Stat icon={Trophy} label="LESSONS TO GO" value={Math.max(lessons.length - completeCount, 0)} suffix="lessons" tone="cyan" detail="Choose any section to continue" /></div>
    <section className="feature-grid">
      <div className="panel continue-panel"><div className="panel-top"><div><div className="panel-kicker">{nextLesson ? 'CONTINUE YOUR QUEST' : 'LEARNING PATH'}</div><h2>{nextLesson?.title || 'Every lesson complete'}</h2></div><div className="topic-icon"><GitBranch size={20} /></div></div><p className="panel-copy">{currentModule?.summary || 'Your learning worlds will appear here once the curriculum is available.'}</p><div className="lesson-progress-label"><span>{currentModule ? `${currentModule.section?.toUpperCase() || 'WORLD'} · ${currentModule.title}` : 'CURRICULUM'}</span><span>{nextLesson ? `${currentModule.lessons.filter((lesson) => lesson.completed).length}/${currentModule.lessons.length} COMPLETE` : 'COMPLETE'}</span></div><div className="progress-track"><span style={{ width: `${currentLessonProgress}%` }} /></div><div className="continue-bottom"><div className="lesson-meta"><span><span className="tiny-dot" /> {nextLesson?.duration_minutes || 0} min</span><span><span className="tiny-dot violet-dot" /> {nextLesson?.difficulty || 'Mastered'}</span></div><button className="primary-button" disabled={!nextLesson} onClick={() => nextLesson && onOpenLesson(nextLesson)}> {nextLesson ? (completeCount ? 'Continue lesson' : 'Start lesson') : 'Path complete'} <ArrowRight size={15} /></button></div></div>
      <div className="panel activity-panel"><div className="panel-top"><div><div className="panel-kicker">YOUR MOMENTUM</div><h2>Small steps add up</h2></div><span className="period-select">This week</span></div><ActivityChart data={weeklyActivity} /><div className="chart-foot"><span><i className="chart-legend" /> XP earned per day</span><strong>{weeklyActivity.reduce((sum, day) => sum + day.xp, 0)} XP <small>this week</small></strong></div>{!hasActivity && <p className="chart-empty">Complete a lesson to start your activity history.</p>}</div>
    </section>
    <section className="lower-grid"><div className="panel game-panel"><div className="panel-top"><div><div className="panel-kicker">WARM UP YOUR BRAIN</div><h2>Sorting lab <span className="live-badge">INTERACTIVE</span></h2></div><button className="subtle-button" onClick={() => onNavigate('Mini-games')}>All games <ArrowRight size={14} /></button></div><p className="game-description">Watch a sorting algorithm think. Pick a method, then step through each comparison.</p><div className="sort-toolbar"><div className="select-wrap"><select value={sort} onChange={(e) => { setSort(e.target.value) }} aria-label="Sorting algorithm"><option>Bubble sort</option><option>Selection sort</option><option>Insertion sort</option><option>Merge sort</option></select><ChevronDown size={13} /></div><button className="shuffle-button" onClick={randomize}>Shuffle <Activity size={13} /></button></div><div className="bars-wrap" aria-label="Array visualization">{numbers.map((n, i) => <motion.div layout key={`${i}-${n}`} className={`bar ${pair?.includes(i) ? 'bar-focus' : ''}`} style={{ height: `${18 + n * 4}px` }}><span>{n}</span></motion.div>)}</div><div className="game-bottom"><span>COMPARISONS <strong>{comparisons}</strong><span className="divider-dot">·</span> SWAPS <strong>{swaps}</strong></span><button className="step-button" disabled={sortStep >= traceLength} onClick={nextSortStep}>{sortStep >= traceLength ? 'Sorted' : 'Next step'} <ArrowRight size={14} /></button></div></div>
      <div className="right-stack"><div className="panel mission-panel"><div className="panel-top"><div><div className="panel-kicker">PRACTICE RECOMMENDATION</div><h2>Think in pairs</h2></div><div className="mission-icon"><BrainCircuit size={20} /></div></div><p className="mission-copy">Try the two-sum challenge and compare a nested scan with a hash map.</p><div className="mission-footer"><span className="mission-reward">Hash maps · Beginner</span><button className="text-link" onClick={() => onNavigate('Coding arena')}>Open arena <ArrowRight size={13} /></button></div></div><div className="panel achievement-panel"><div className="panel-top"><div><div className="panel-kicker">YOUR NEXT MILESTONE</div><h2>{completeCount ? 'Keep the chain going' : 'First steps'}</h2></div><div className="badge-icon"><Award size={22} /></div></div><div className="badge-bottom"><span>{completeCount ? `${completeCount} lesson${completeCount === 1 ? '' : 's'} completed` : 'Complete a lesson to earn XP'}</span><span className="badge-check">{completeCount ? <CheckIcon /> : '·'}</span></div></div></div></section>
    <section className="roadmap-preview"><div className="section-heading"><div><div className="panel-kicker">THE LONG GAME</div><h2>Your learning path</h2></div><button className="text-link" onClick={() => onNavigate('Learning path')}>Explore roadmap <ArrowRight size={14} /></button></div><div className="path-track"><div className="path-line"><span style={{ width: `${apiModules.length ? (apiModules.filter((module) => module.lessons.length && module.lessons.every((lesson) => lesson.completed)).length / Math.min(apiModules.length, 5)) * 100 : 0}%` }} /></div>{apiModules.slice(0, 5).map((module) => { const complete = module.lessons.length > 0 && module.lessons.every((lesson) => lesson.completed); return <button key={module.id} onClick={() => onNavigate('Learning path')} className={`path-node ${complete ? 'node-done' : 'node-current'}`}><span className="node-circle">{complete ? '✓' : <Sparkles size={14} />}</span><span className="node-title">{module.title}</span><span className="node-status">{complete ? 'CLEARED' : 'OPEN'}</span></button>})}</div></section>
    <footer className="page-footer"><span>Made for the curious mind.</span><span><CircleHelp size={13} /> Every expert was once a beginner.</span></footer>
  </>
}

function Stat({ icon: Icon, label, value, suffix, tone, detail }) { return <div className="stat-card"><div className={`stat-icon stat-${tone}`}><Icon size={16} /></div><div className="stat-label">{label}</div><div className="stat-number">{value}<span>{suffix}</span></div><div className="stat-detail">{detail}</div></div> }
function CheckIcon() { return <span aria-hidden="true">✓</span> }
function Leaderboard({ data, loading, error, account, onSaveNickname }) {
  return <section className="roadmap-page"><div className="eyebrow"><span className="eyebrow-line" /> THIS WEEK'S QUEST <span className="eyebrow-line" /></div><h1>Weekly <span className="gradient-text">leaderboard.</span></h1><p className="welcome-sub">Earn points by completing lessons. Your login name and email stay private.</p>{account?.authenticated && <NicknameEditor nickname={account.profile.nickname} onSave={onSaveNickname} />}{loading ? <div className="panel mt-5 p-5">Loading this week's scores…</div> : error ? <div className="panel mt-5 p-5" role="alert">{error}</div> : <><div className="panel mt-5 p-4"><div className="panel-kicker">WEEK STARTING {data?.weekStart || ''} · {data?.timezone || ''}</div>{data?.entries?.length ? <ol className="roadmap-list mt-4">{data.entries.map((entry) => <li key={`${entry.rank}-${entry.nickname}`} className="module-row module-current"><div className="module-number tone-violet">{entry.rank}</div><div className="module-main"><h2>{entry.nickname}</h2><div className="flex flex-wrap gap-2 mt-2">{entry.badges.map((badge) => <span className="mission-reward" key={badge.slug}><Award size={12} className="inline" /> {badge.name}</span>)}</div></div><div className="module-lessons"><Zap size={14} />{entry.weeklyXp} XP</div></li>)}</ol> : <p className="welcome-sub mt-4">No scores yet this week. Complete a lesson to claim the first spot.</p>}</div><p className="welcome-sub mt-4">Casual points reset each Monday. They are based on browser-checked activities and are not cheat-proof.</p></>}</section>
}
function NicknameEditor({ nickname, onSave }) {
  const [value, setValue] = useState(nickname || '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => setValue(nickname || ''), [nickname])
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError('')
    try { await onSave(value) } catch (saveError) { setError(saveError.message) } finally { setBusy(false) }
  }
  return <form className="panel mt-5 flex flex-wrap items-end gap-3 p-4" onSubmit={submit}><label className="module-main">Your public nickname<input required minLength={3} maxLength={24} value={value} onChange={(event) => setValue(event.target.value)} /></label><button className="primary-button" disabled={busy}>{busy ? 'Saving…' : 'Update nickname'}</button>{error && <span role="alert" className="auth-error">{error}</span>}</form>
}
function ActivityChart({ data }) { const max = Math.max(1, ...data.map((day) => day.xp)); return <div className="activity-chart">{data.map((day, i) => <div key={day.date} className="chart-day" title={`${day.date}: ${day.xp} XP`}><div className="chart-bar-track"><span style={{ height: `${day.xp ? Math.max(8, day.xp / max * 100) : 0}%` }} className={i === data.length - 1 ? 'chart-bar today' : 'chart-bar'} /></div><span>{day.label?.[0] || ''}</span></div>)}</div> }
function SearchDialog({ modules: source, onClose, onSelect }) {
  const [query, setQuery] = useState('')
  const results = source.flatMap((module) => module.lessons.map((lesson) => ({ ...lesson, moduleTitle: module.title }))).filter((lesson) => `${lesson.title} ${lesson.moduleTitle}`.toLowerCase().includes(query.toLowerCase())).slice(0, 10)
  return <div className="search-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="search-dialog" role="dialog" aria-modal="true" aria-label="Search lessons"><div className="search-input-row"><Search size={17} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Escape') onClose() }} placeholder="Search lessons and topics…" aria-label="Search lessons and topics" /><kbd>ESC</kbd><button className="icon-button" onClick={onClose} aria-label="Close search"><X size={16} /></button></div><div className="search-results">{results.length ? results.map((lesson) => <button key={lesson.slug} onClick={() => onSelect(lesson)} className="search-result"><BookOpen size={15} /><span><strong>{lesson.title}</strong><small>{lesson.moduleTitle} · {lesson.duration_minutes} min</small></span></button>) : <p>No matching lessons. Try a topic like arrays or loops.</p>}</div><div className="search-hint">Search the full learning library</div></section></div>
}
function Roadmap({ onSelect, apiModules, loading, error, onRetry }) {
  if (loading) return <div className="roadmap-page"><div className="panel-kicker">THE QUEST MAP</div><h1>Loading your learning path…</h1></div>
  if (error || !apiModules.length) return <div className="roadmap-page"><div className="panel-kicker">THE QUEST MAP</div><h1>Learning path unavailable</h1><p className="welcome-sub">{error || 'The curriculum has not been seeded yet. Start the Django API and run the seed_curriculum command.'}</p><button className="primary-button mt-5" onClick={onRetry}>Try again <ArrowRight size={14} /></button></div>
  const items = apiModules.map((module) => ({ ...module, completedCount: module.lessons.filter((lesson) => lesson.completed).length, complete: module.lessons.length > 0 && module.lessons.every((lesson) => lesson.completed) }))
  const sections = [
    { id: 'basics', label: 'Basics', description: 'Build the foundations and learn how to reason about data.' },
    { id: 'medium', label: 'Medium', description: 'Practice common data structures and problem-solving patterns.' },
    { id: 'advanced', label: 'Advanced', description: 'Explore trees, graphs, and advanced algorithmic techniques.' },
  ]
  return <div className="roadmap-page"><div className="eyebrow"><span className="eyebrow-line" /> THE QUEST MAP <span className="eyebrow-line" /></div><h1>Three sections. <span className="gradient-text">Your adventure.</span></h1><p className="welcome-sub">Choose any section and learn at your own pace. Suggested prerequisites help you decide where to begin.</p>{sections.map((section) => <section className="roadmap-section" key={section.id}><div className="section-heading"><div><div className="panel-kicker">OPEN SECTION</div><h2>{section.label}</h2></div><span className="welcome-sub">{items.filter((module) => module.section === section.id && module.complete).length}/{items.filter((module) => module.section === section.id).length} worlds cleared</span></div><p className="welcome-sub roadmap-section-copy">{section.description}</p><div className="roadmap-list">{items.filter((module) => module.section === section.id).map((module, i) => {
    const color = ['blue', 'violet', 'cyan', 'amber', 'rose'][i % 5]
    return <button className={`module-row ${module.complete ? 'module-complete' : 'module-current'}`} key={module.id || module.number} onClick={() => onSelect(module)}><div className={`module-number tone-${color}`}>{module.complete ? '✓' : String(module.number).padStart(2, '0')}</div><div className="module-main"><div className="module-overline">WORLD {String(module.number).padStart(2, '0')} <span>·</span> {module.complete ? 'CLEARED' : 'OPEN'}</div><h2>{module.title}</h2><p>{module.summary}</p></div><div className="module-lessons"><BookOpen size={14} />{module.completedCount}/{module.lessons.length} lessons</div><ChevronRight size={17} className="module-chevron" /></button>
  })}</div></section>)}</div>
}
function ComingSoon({ name, onBack }) { return <div className="coming-soon"><div className="topic-icon"><Sparkles size={21} /></div><div className="panel-kicker">ADVENTURE EXPANDING</div><h1>{name}</h1><p>This part of the quest is being built. Your learning path is already mapped, and this space will open as the next phase lands.</p><button className="primary-button" onClick={onBack}>Back to home <ArrowRight size={15} /></button></div> }

export default App
