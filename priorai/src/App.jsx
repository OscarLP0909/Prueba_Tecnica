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

export default function App() {
  const [input, setInput] = useState('')
  const [context, setContext] = useState('')
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dark, setDark] = useState(false)

  useEffect(() => {
    document.body.classList.toggle('dark', dark)
  }, [dark])

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
    } catch (e) {
      setError('Error al conectar con la IA. Revisa tu API key.')
    }
    setLoading(false)
  }

  function handleReset() {
    setTasks([])
    setInput('')
    setContext('')
  }

  return (
    <div className="app">
      <button className="theme-toggle" onClick={() => setDark(!dark)}>
        {dark ? '☀ Claro' : '☾ Oscuro'}
      </button>

      <header>
        <div className="logo">
          <span className="logo-prior">Prior</span><span className="logo-ai">AI</span>
        </div>
        <p>Escribe tus tareas y la IA las prioriza con explicaciones</p>
      </header>

      {tasks.length === 0 ? (
        <div className="card">
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
              {loading ? 'Priorizando...' : 'Priorizar tareas →'}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="results-header">
            <span>{tasks.length} tareas priorizadas</span>
            <button className="secondary" onClick={handleReset}>Nueva lista</button>
          </div>
          {tasks.map((task, i) => {
            const c = BADGE_COLORS[i % BADGE_COLORS.length]
            return (
              <div className="task-card" key={i}>
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
        </>
      )}
    </div>
  )
}