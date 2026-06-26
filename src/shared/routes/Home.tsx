import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Stage from '../components/Stage'
import Wordmark from '../components/Wordmark'
import { GAMES } from '../lib/games'
import { ensureAnonSession } from '../lib/supabase'
import { createRoom } from '../lib/room'

export default function Home() {
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function play() {
    setError(null)
    setBusy(true)
    try {
      await ensureAnonSession()
      const room = await createRoom()
      navigate(`/host/${room.join_code}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start a room')
      setBusy(false)
    }
  }

  function locked(name: string) {
    setToast(`${name} is coming soon`)
    window.clearTimeout((locked as { t?: number }).t)
    ;(locked as { t?: number }).t = window.setTimeout(() => setToast(null), 1800)
  }

  return (
    <Stage className="flex min-h-screen flex-col items-center px-8 py-10">
      <header className="mb-10 flex flex-col items-center text-center">
        <Wordmark size="lg" />
        <p className="mt-4 text-xl text-white/70">Pick a game. Grab your phones.</p>
      </header>

      <div className="grid w-full max-w-6xl grid-cols-2 gap-6 md:grid-cols-3">
        {GAMES.map((g) => (
          <button
            key={g.id}
            onClick={() => (g.active ? play() : locked(g.name))}
            disabled={busy && g.active}
            className={`pf-glass group relative flex aspect-[4/3] flex-col justify-between rounded-tile p-6 text-left transition
              ${g.active ? 'hover:-translate-y-1 hover:bg-white/[.12]' : 'cursor-not-allowed opacity-60'}`}
            style={{ boxShadow: g.active ? `0 0 0 1px ${g.accent}55, 0 18px 40px -18px ${g.accent}` : undefined }}
            aria-label={g.active ? `Play ${g.name}` : `${g.name}, coming soon`}
          >
            <div className="flex items-start justify-between">
              <span className="text-5xl drop-shadow-lg" aria-hidden>{g.icon}</span>
              <span
                className="rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide"
                style={{ background: `${g.accent}22`, color: g.accent }}
              >
                {g.active ? 'Ready' : 'Locked'}
              </span>
            </div>

            <div>
              <h2 className="pf-wordmark text-3xl text-white">{g.name}</h2>
              <p className="mt-1 text-sm text-white/60">{g.tagline}</p>
            </div>

            {g.active && (
              <span
                className="mt-2 inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-grape-900"
                style={{ background: 'linear-gradient(95deg,#06b6d4,#84cc16)' }}
              >
                {busy ? 'Starting…' : 'Play now'}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && <p className="mt-6 text-p-rose">{error}</p>}

      {toast && (
        <div className="pf-glass animate-popIn fixed bottom-8 left-1/2 -translate-x-1/2 rounded-card px-5 py-3 text-white/90">
          {toast}
        </div>
      )}
    </Stage>
  )
}
