import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Stage from '../components/Stage'
import Wordmark from '../components/Wordmark'
import { GAMES } from '../lib/games'
import type { GameId } from '../lib/types'
import { ensureAnonSession } from '../lib/supabase'
import { createRoom } from '../lib/room'
import { sound } from '../lib/sound'
import SoundToggle from '../components/SoundToggle'

export default function Home() {
  const navigate = useNavigate()
  useEffect(() => sound.armAutostart(), [])
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tvMode, setTvMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    const coarse = window.matchMedia?.('(pointer: coarse)')?.matches
    return !(coarse && window.innerWidth < 900) // phones can't start games — TV only
  })

  async function play(gameId: GameId) {
    setError(null)
    setBusy(true)
    try {
      sound.init()
      sound.startMusic()
      await ensureAnonSession()
      const room = await createRoom(gameId)
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
    <Stage className="relative flex h-screen flex-col items-center overflow-hidden px-8 py-6">
      <div className="absolute right-6 top-6"><SoundToggle /></div>
      <header className="mb-6 flex shrink-0 flex-col items-center text-center">
        <Wordmark size="md" />
        <p className="mt-2 text-lg text-white/70">Pick a game. Grab your phones.</p>
      </header>

      <div className="grid w-full max-w-6xl flex-1 grid-cols-2 content-center gap-5 md:grid-cols-3">
        {!tvMode && (
          <div className="col-span-full pf-glass rounded-card p-8 text-center">
            <h2 className="pf-wordmark text-3xl">Looks like you're on a phone</h2>
            <p className="mx-auto mt-3 max-w-md text-lg text-white/65">Games start on the TV. Your phone is the controller — set your name once, then scan the TV's QR to play.</p>
            <button
              onClick={() => navigate('/phone')}
              className="mt-6 rounded-card px-8 py-4 text-lg font-bold text-grape-900"
              style={{ background: 'linear-gradient(95deg,#06b6d4,#84cc16)' }}
            >I'm a player — take me to my controller</button>
            <p className="mt-4"><button onClick={() => setTvMode(true)} className="text-sm text-cyan underline">Actually, this device is the TV</button></p>
          </div>
        )}
        {tvMode && GAMES.map((g) => (
          <button
            key={g.id}
            onClick={() => (g.active ? play(g.id) : locked(g.name))}
            disabled={busy && g.active}
            className={`pf-glass group relative flex max-h-[30vh] min-h-[190px] flex-col justify-between rounded-tile p-5 text-left transition
              ${g.active ? 'hover:-translate-y-1 hover:bg-white/[.12]' : 'cursor-not-allowed opacity-60'}`}
            style={{ boxShadow: g.active ? `0 0 0 1px ${g.accent}55, 0 18px 40px -18px ${g.accent}` : undefined }}
            aria-label={g.active ? `Play ${g.name}` : `${g.name}, coming soon`}
          >
            <div className="flex items-start justify-between">
              <img src={g.icon} alt="" className="h-16 w-16 object-contain drop-shadow-lg" />
              <span
                className="rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide"
                style={{ background: `${g.accent}22`, color: g.accent }}
              >
                {g.active ? 'Ready' : 'Locked'}
              </span>
            </div>

            <div>
              <h2 className="pf-wordmark mt-2 text-2xl text-white lg:text-3xl">{g.name}</h2>
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

      <footer className="mt-auto flex flex-wrap items-center justify-center gap-x-5 gap-y-1 pt-6 text-sm text-white/40">
        <a href="/games/" className="hover:text-white/70">Games</a>
        <a href="/how-to-play" className="hover:text-white/70">How to Play</a>
        <a href="/about" className="hover:text-white/70">About</a>
        <a href="/contact" className="hover:text-white/70">Contact</a>
        <a href="/privacy" className="hover:text-white/70">Privacy</a>
      </footer>

      {toast && (
        <div className="pf-glass animate-popIn fixed bottom-8 left-1/2 -translate-x-1/2 rounded-card px-5 py-3 text-white/90">
          {toast}
        </div>
      )}
    </Stage>
  )
}
