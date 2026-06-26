import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import Stage from '../components/Stage'
import Wordmark from '../components/Wordmark'
import { ensureAnonSession } from '../lib/supabase'
import { getRoomByCode, joinRoom, listPlayers, myPlayer, subscribePlayers } from '../lib/room'
import { COLOR_KEYS, PAL, type ColorKey, type Player, type Room } from '../lib/types'

type Phase = 'loading' | 'notfound' | 'join' | 'waiting'

export default function Join() {
  const { code = '' } = useParams()
  const [phase, setPhase] = useState<Phase>('loading')
  const [room, setRoom] = useState<Room | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [me, setMe] = useState<Player | null>(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState<ColorKey | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const takenColors = useMemo(
    () => new Set(players.filter((p) => p.id !== me?.id).map((p) => p.color)),
    [players, me],
  )

  useEffect(() => {
    let unsub: (() => void) | undefined
    ;(async () => {
      await ensureAnonSession()
      const r = await getRoomByCode(code)
      if (!r) {
        setPhase('notfound')
        return
      }
      setRoom(r)
      const roster = await listPlayers(r.id)
      setPlayers(roster)
      const existing = await myPlayer(r.id)
      if (existing) {
        setMe(existing)
        setPhase('waiting')
      } else {
        setPhase('join')
      }
      unsub = subscribePlayers(r.id, setPlayers)
    })().catch((e) => {
      console.error(e)
      setPhase('notfound')
    })
    return () => unsub?.()
  }, [code])

  async function submit() {
    if (!room || !name.trim() || !color) return
    setSubmitting(true)
    setError(null)
    try {
      const player = await joinRoom(room.join_code, name.trim(), color)
      setMe(player)
      setPhase('waiting')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not join'
      // Friendly mapping for the most common race: colour taken between render and submit.
      setError(/duplicate|unique|taken/i.test(msg) ? 'That colour was just taken — pick another.' : msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (phase === 'loading') {
    return (
      <Stage className="flex min-h-screen items-center justify-center">
        <p className="text-white/70">Joining room {code.toUpperCase()}…</p>
      </Stage>
    )
  }

  if (phase === 'notfound') {
    return (
      <Stage className="flex min-h-screen flex-col items-center justify-center px-8 text-center">
        <Wordmark size="sm" />
        <p className="mt-6 text-xl text-white/80">Room {code.toUpperCase()} isn’t open.</p>
        <p className="mt-2 text-white/50">Ask the host to start a game, then scan again.</p>
      </Stage>
    )
  }

  if (phase === 'waiting' && me) {
    return (
      <Stage className="flex min-h-screen flex-col items-center justify-center px-8 text-center">
        <span
          className="animate-floaty mb-6 inline-block h-16 w-16 rounded-full"
          style={{ background: PAL[me.color], boxShadow: `0 0 40px ${PAL[me.color]}` }}
        />
        <h1 className="pf-wordmark text-4xl text-white">You’re in!</h1>
        <p className="mt-2 text-lg text-white/70">Waiting for the host to start.</p>
        <p className="mt-1 text-sm text-white/45">Watch the TV — {players.length} in the room.</p>
      </Stage>
    )
  }

  // phase === 'join'
  const canSubmit = name.trim().length > 0 && !!color && !submitting
  return (
    <Stage className="flex min-h-screen flex-col px-7 pb-10 pt-8">
      <div className="mb-7 flex flex-col items-center text-center">
        <Wordmark size="sm" />
        <h1 className="pf-wordmark mt-4 text-3xl text-white">Join the party</h1>
        <p className="mt-1 text-white/60">Pick a name and your colour.</p>
      </div>

      <label className="mb-2 text-xs uppercase tracking-widest text-white/50">Your name</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value.slice(0, 16))}
        placeholder="e.g. Aisha"
        autoComplete="off"
        className="pf-glass mb-7 rounded-card px-4 py-4 text-lg text-white placeholder-white/35 outline-none"
      />

      <label className="mb-3 text-xs uppercase tracking-widest text-white/50">Your colour</label>
      <div className="grid grid-cols-4 gap-4">
        {COLOR_KEYS.map((key) => {
          const taken = takenColors.has(key)
          const selected = color === key
          return (
            <button
              key={key}
              disabled={taken}
              onClick={() => setColor((c) => (c === key ? null : key))}
              aria-label={`${key}${taken ? ', taken' : ''}`}
              className="relative aspect-square rounded-full transition"
              style={{
                background: PAL[key],
                opacity: taken ? 0.26 : 1,
                transform: selected ? 'scale(1.09)' : 'scale(1)',
                boxShadow: taken
                  ? 'none'
                  : selected
                    ? `0 0 26px ${PAL[key]}`
                    : '0 8px 18px rgba(0,0,0,.28)',
                cursor: taken ? 'not-allowed' : 'pointer',
              }}
            >
              {selected && (
                <span className="absolute inset-0 grid place-items-center text-2xl text-white">✓</span>
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
