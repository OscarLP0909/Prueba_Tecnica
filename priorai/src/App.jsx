import { useState, useEffect } from 'react'
import { prioritizeTasks } from './lib/gemini'
import './App.css'

const BADGE_COLORS = [
  { bg: '#EEEDFE', color: '#3C3489' },
  { bg: '#E1F5EE', color: '#085041' },
  { bg: '#FAEEDA', color: '#633806' },
  { bg: '#FAECE7', color: '#712B13' },
  { bg: '#E6F1FB', color: '#0C447C' },
]

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function App() {
  const [input, setInput] = useState('')
  const [context, setContext] = useState('')
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dark, setDark] = useState(false)
  const [history, setHistory] = useState([])
  const [view, setView] = useState('form')
  const [selectedEntry, setSelectedEntry] = useState(null)

  useEffect(() => {
    document.body.classList.toggle('dark', dark)
  }, [dark])

  useEffect(() => {
    const saved = localStorage.getItem('priorai_history')
    if (saved) setHistory(JSON.parse(saved))
  }, [])

  async function handlePrioritize() {
    const lines = input.split('\n').map(t => t.trim()).filter(Boolean)
    if (lines.length < 2) {
      setError('Añade al menos 2 tareas')
      return
    }
    setError('')
    setLoading(true)
    try {
      const result = await prioritizeTasks(lines, context)
      setTasks(result.tasks)

      const entry = {
        id: Date.now(),
        date: new Date().toISOString(),
        context,
        tasks: result.tasks
      }
      const newHistory = [entry, ...history].slice(0, 10)
      setHistory(newHistory)
      setSelectedEntry(entry)
      localStorage.setItem('priorai_history', JSON.stringify(newHistory))
      setView('result')
    } catch (e) {
      setError('Error al conectar con la IA. Revisa tu API key.')
    }
    setLoading(false)
  }

  function handleReset() {
    setTasks([])
    setInput('')
    setContext('')
    setSelectedEntry(null)
    setView('form')
  }

  function loadFromHistory(entry) {
    setTasks(entry.tasks)
    setContext(entry.context)
    setSelectedEntry(entry)
    setView('result')
  }

  function clearHistory() {
    setHistory([])
    setSelectedEntry(null)
    localStorage.removeItem('priorai_history')
  }

  const showSidebar = history.length > 0

  return (
    <div className={`layout ${showSidebar ? 'with-sidebar' : ''}`}>

      {showSidebar && (
        <aside className="sidebar">
          <div className="sidebar-header">
            <span className="sidebar-title">Historial</span>
            <button className="clear-btn" onClick={clearHistory}>Borrar</button>
          </div>
          <div className="sidebar-list">
            {history.map((entry) => (
              <div
                key={entry.id}
                className={`sidebar-entry ${selectedEntry?.id === entry.id ? 'active' : ''}`}
                onClick={() => loadFromHistory(entry)}
              >
                <div className="sidebar-entry-date">{formatDate(entry.date)}</div>
                {entry.context && (
                  <div className="sidebar-entry-context">"{entry.context}"</div>
                )}
                <div className="sidebar-entry-tasks">
                  {entry.tasks.map((t, i) => (
                    <div key={i} className="sidebar-entry-task">
                      <span className="sidebar-entry-num">{i + 1}</span>
                      <span>{t.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>
      )}

      <main className="app">
        <button className="theme-toggle" onClick={() => setDark(!dark)}>
          {dark ? '☀ Claro' : '☾ Oscuro'}
        </button>

        <header>
          <div className="logo">
            <span className="logo-prior">Prior</span><span className="logo-ai">AI</span>
          </div>
          <p>Escribe tus tareas y la IA las prioriza con explicaciones</p>
        </header>

        {view === 'form' && (
          <div className="card view-enter">
            <label>Tareas de hoy <span>(una por línea)</span></label>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={"Responder emails del cliente\nPreparar presentación\nLlamar al banco\nRevisar pull requests"}
              rows={6}
            />
            <label style={{ marginTop: '12px' }}>
              Contexto adicional <span>(opcional)</span>
            </label>
            <input
              type="text"
              value={context}
              onChange={e => setContext(e.target.value)}
              placeholder="Ej: tengo reunión a las 5, estoy con poca energía..."
            />
            {error && <p className="error">{error}</p>}
            <div className="actions">
              <button onClick={handlePrioritize} disabled={loading}>
                {loading
                  ? <span className="btn-loading"><span className="spinner" /> Priorizando...</span>
                  : 'Priorizar tareas →'
                }
              </button>
            </div>
          </div>
        )}

        {view === 'result' && (
          <div className="view-enter">
            <div className="results-header">
              <div>
                <span className="results-count">{tasks.length} tareas priorizadas</span>
                {selectedEntry?.context && (
                  <div className="results-context">"{selectedEntry.context}"</div>
                )}
                {selectedEntry?.date && (
                  <div className="results-date">{formatDate(selectedEntry.date)}</div>
                )}
              </div>
              <button className="secondary" onClick={handleReset}>Nueva lista</button>
            </div>
            {tasks.map((task, i) => {
              const c = BADGE_COLORS[i % BADGE_COLORS.length]
              return (
                <div className="task-card" key={i} style={{ animationDelay: `${i * 0.07}s` }}>
                  <div className="badge" style={{ background: c.bg, color: c.color }}>
                    {i + 1}
                  </div>
                  <div>
                    <div className="task-title">{task.title}</div>
                    <div className="task-reason">{task.reason}</div>
                  </div>
                </div>
              )
            })}
            <div className="bottom-actions">
              <button className="secondary" onClick={handleReset}>← Nueva lista</button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}