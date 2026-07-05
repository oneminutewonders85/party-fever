import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import Stage from '../components/Stage'
import Wordmark from '../components/Wordmark'
import { ensureAnonSession } from '../lib/supabase'
import { getRoomByCode, joinRoom, listPlayers, myPlayer, refreshRoom, subscribePlayers } from '../lib/room'
import { getModule } from '../../games/registry'
import PhoneGameOver from '../components/PhoneGameOver'
import { loadProfile, saveProfile } from '../lib/profile'
import { useNavigate } from 'react-router-dom'
import { COLOR_KEYS, PAL, type ColorKey, type Player, type Room } from '../lib/types'

type Phase = 'loading' | 'notfound' | 'join' | 'waiting' | 'playing'

export default function JoinShell() {
  const { code = '' } = useParams()
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>('loading')
  const [room, setRoom] = useState<Room | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [me, setMe] = useState<Player | null>(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState<ColorKey | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const taken = useMemo(
    () => new Set(players.filter((p) => p.id !== me?.id).map((p) => p.color)),
    [players, me],
  )

  useEffect(() => {
    let unsub: (() => void) | undefined
    ;(async () => {
      await ensureAnonSession()
      const r = await getRoomByCode(code)
      if (!r) return setPhase('notfound')
      setRoom(r)
      setPlayers(await listPlayers(r.id))
      const mine = await myPlayer(r.id)
      setMe(mine)
      if (mine) {
        setPhase(r.status !== 'lobby' ? 'playing' : 'waiting')
      } else {
        // returning player: the phone remembers who you are — join instantly
        const prof = loadProfile()
        if (prof && r.status === 'lobby') {
          setName(prof.name)
          setColor(prof.color)
          try {
            const player = await joinRoom(r.join_code, prof.name, prof.color)
            setMe(player)
            setPhase('waiting')
          } catch {
            // colour clash or room full — fall back to the form, prefilled
            setPhase('join')
          }
        } else {
          if (prof) { setName(prof.name); setColor(prof.color) }
          setPhase('join')
        }
      }
      unsub = subscribePlayers(r.id, setPlayers)
    })().catch(() => setPhase('notfound'))
    return () => unsub?.()
  }, [code])

  // poll room status so the phone follows lobby -> playing -> finished
  useEffect(() => {
    if (!room || phase === 'join' || phase === 'loading' || phase === 'notfound') return
    const id = window.setInterval(async () => {
      const r = await refreshRoom(room.id)
      if (!r || r.status === 'closed') { navigate('/phone'); return }
      setRoom(r)
      if (r.status !== 'lobby') setPhase('playing')
      else if (me) setPhase('waiting')
    }, 2500)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.id, phase, me?.id])

  async function submit() {
    if (!room || !name.trim() || !color) return
    setSubmitting(true)
    setError(null)
    try {
      const player = await joinRoom(room.join_code, name.trim(), color)
      saveProfile({ name: name.trim(), color })
      setMe(player)
      setPhase('waiting')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not join'
      setError(/taken|duplicate|unique/i.test(msg) ? 'That colour was just taken — pick another.' : msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (phase === 'loading') {
    return <Stage className="flex min-h-[100dvh] items-center justify-center"><p className="text-white/70">Joining {code.toUpperCase()}…</p></Stage>
  }
  if (phase === 'notfound') {
    return (
      <Stage className="flex min-h-[100dvh] flex-col items-center justify-center px-8 text-center">
        <Wordmark size="sm" />
        <p className="mt-6 text-xl text-white/80">Room {code.toUpperCase()} isn’t open.</p>
      </Stage>
    )
  }

  if (phase === 'playing' && room && me) {
    const meNow = players.find((p) => p.id === me.id) ?? me
    const mod = getModule(room.current_game)
    const finished = room.status === 'finished'
    return (
      <Stage className="relative min-h-[100dvh]">
        {!finished && (
          <div className="absolute right-3 top-3 z-20">
            <button
              onClick={() => window.confirm('Leave the game and return home?') && navigate('/phone')}
              className="pf-glass rounded-full px-4 py-2 text-sm font-semibold text-white/75"
            >Exit</button>
          </div>
        )}
        {mod ? <mod.PhoneView room={room} me={meNow} players={players} /> : <p className="p-6">Unknown game.</p>}
        {finished && <PhoneGameOver players={players} meId={me.id} />}
      </Stage>
    )
  }
  if (phase === 'waiting' && me) {
    return (
      <Stage className="relative flex min-h-[100dvh] flex-col items-center justify-center px-8 text-center">
        <button onClick={() => window.confirm('Leave the room?') && navigate('/phone')}
          className="pf-glass absolute left-3 top-3 rounded-full px-4 py-2 text-sm font-semibold text-white/75">Exit</button>
        <span className="animate-floaty mb-6 inline-block h-16 w-16 rounded-full" style={{ background: PAL[me.color], boxShadow: `0 0 40px ${PAL[me.color]}` }} />
        <h1 className="pf-wordmark text-4xl">You’re in!</h1>
        <p className="mt-2 text-lg text-white/70">Waiting for the host to start.</p>
        <p className="mt-1 text-sm text-white/45">{players.length} in the room — watch the TV.</p>
      </Stage>
    )
  }

  // join form
  const canSubmit = name.trim().length > 0 && !!color && !submitting
  return (
    <Stage className="flex min-h-[100dvh] flex-col px-7 pb-10 pt-8">
      <div className="mb-7 flex flex-col items-center text-center">
        <Wordmark size="sm" />
        <h1 className="pf-wordmark mt-4 text-3xl">Join the party</h1>
        <p className="mt-1 text-white/60">Pick a name and your colour.</p>
      </div>

      <label className="mb-2 text-xs uppercase tracking-widest text-white/50">Your name</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value.slice(0, 16))}
        placeholder="e.g. Aisha"
        className="pf-glass mb-7 rounded-card px-4 py-4 text-lg text-white placeholder-white/35 outline-none"
      />

      <label className="mb-3 text-xs uppercase tracking-widest text-white/50">Your colour</label>
      <div className="grid grid-cols-4 gap-4">
        {COLOR_KEYS.map((key) => {
          const isTaken = taken.has(key)
          const sel = color === key
          return (
            <button
              key={key}
              disabled={isTaken}
              onClick={() => setColor((c) => (c === key ? null : key))}
              aria-label={`${key}${isTaken ? ', taken' : ''}`}
              className="relative aspect-square rounded-full transition"
              style={{
                background: PAL[key],
                opacity: isTaken ? 0.26 : 1,
                transform: sel ? 'scale(1.09)' : 'scale(1)',
                boxShadow: isTaken ? 'none' : sel ? `0 0 26px ${PAL[key]}` : '0 8px 18px rgba(0,0,0,.28)',
                cursor: isTaken ? 'not-allowed' : 'pointer',
              }}
            >
              {sel && <span className="absolute inset-0 grid place-items-center text-2xl text-white">✓</span>}
              {isTaken && (
                <span className="absolute inset-0 flex items-center justify-center" aria-hidden>
                  <span className="block h-[3px] w-[150%] rotate-45 rounded bg-white/80 shadow" />
                </span>
              )}
            </button>
          )
        })}
      </div>

      {error && <p className="mt-5 text-p-rose">{error}</p>}

      <button
        onClick={submit}
        disabled={!canSubmit}
        className="mt-auto rounded-card px-6 py-4 text-lg font-bold text-grape-900 transition disabled:opacity-40"
        style={{ background: 'linear-gradient(95deg,#06b6d4,#84cc16)' }}
      >
        {submitting ? 'Joining…' : "I'm in!"}
      </button>
    </Stage>
  )
}
