import { useEffect, useRef, useState } from 'react'
import type { PhoneViewProps } from '../../shared/lib/gameModule'
import { openRoomChannel, type RoomChannel } from '../../shared/lib/realtime'
import { useLocalCountdown } from '../../shared/lib/useLocalCountdown'
import { sound } from '../../shared/lib/sound'
import { PAL } from '../../shared/lib/types'
import TimerRing from '../../shared/components/TimerRing'
import { ConfettiIcon, SpinnerWheelIcon } from '../../shared/components/icons'
import { ssPick, ssSolve, ssSpin, useSs } from './api'
import { useSpinHold } from './useSpinHold'
import { SpinnerWheelIcon as HoldWheelIcon } from '../../shared/components/icons'

export default function SpinSpellPhone({ room, me, players }: PhoneViewProps) {
  const syncCb = useRef<() => void>(() => {})
  const chan = useRef<RoomChannel | null>(null)
  const { ss } = useSs(room, (cb) => (syncCb.current = cb))
  const [busy, setBusy] = useState(false)
  const [solving, setSolving] = useState(false)
  const [attempt, setAttempt] = useState('')
  const [flash, setFlash] = useState<string | null>(null)

  useEffect(() => {
    chan.current = openRoomChannel(room.join_code, { onSync: () => syncCb.current() })
    return () => chan.current?.cleanup()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.join_code])

  // reset per-turn UI whenever the puzzle or the turn changes
  useEffect(() => { setSolving(false); setAttempt(''); setFlash(null) }, [ss?.round, ss?.turn])

  const spinHolding = useSpinHold(ss?.last, ss?.phase_started)
  const phaseKey = ss ? `${ss.phase}:${ss.round}:${ss.turn}:${ss.wheel ? 'pick' : 'spin'}:${ss.used_letters.length}` : 'none'
  const remaining = useLocalCountdown(phaseKey, ss?.phase_len ?? 0)

  if (!ss) return <Center><p className="text-white/60">Spinning up…</p></Center>

  // Wheel is still travelling on the TV. Show nothing that gives the result away.
  if (spinHolding && ss.phase === 'turn') {
    return (
      <Center>
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="animate-spin" style={{ animationDuration: '1.1s' }}><HoldWheelIcon size={56} /></span>
          <p className="pf-wordmark text-2xl text-white/85">Spinning…</p>
          <p className="text-white/50">Watch the TV</p>
        </div>
      </Center>
    )
  }

  const myTurn = ss.turn === me.id && ss.phase === 'turn'
  const nameOf = (id?: string | null) => players.find((p) => p.id === id)?.name ?? 'someone'
  const myTable = ss.round_pts[me.id] ?? 0

  async function act<T>(fn: () => Promise<T>) {
    if (busy) return
    setBusy(true)
    try { sound.init(); await fn(); syncCb.current(); chan.current?.sendSync() }
    catch (e) { console.error(e) }
    finally { setBusy(false) }
  }

  // ---- finished ----
  if (ss.phase === 'finished') {
    const ranked = [...players].sort((a, b) => b.score - a.score)
    const iWon = ranked[0]?.id === me.id
    return (
      <Center>
        {iWon && <span className="flex justify-center"><ConfettiIcon size={54} /></span>}
        <h1 className="pf-wordmark mt-2 text-4xl" style={{ color: iWon ? '#84cc16' : '#fff' }}>{iWon ? 'You win!' : 'Game over'}</h1>
        <p className="mt-2 text-white/70">Your score: <span className="text-cyan">{me.score}</span></p>
        <p className="mt-1 text-sm text-white/45">Check the TV for the final leaderboard.</p>
      </Center>
    )
  }

  // ---- reveal ----
  if (ss.phase === 'reveal') {
    const solvedByMe = ss.solved_by === me.id
    return (
      <Center>
        {solvedByMe && <span className="flex justify-center"><ConfettiIcon size={54} /></span>}
        <h1 className="pf-wordmark mt-2 text-3xl" style={{ color: solvedByMe ? '#84cc16' : '#fff' }}>
          {solvedByMe ? 'You solved it!' : `${nameOf(ss.solved_by)} solved it`}
        </h1>
        <p className="mt-3 text-xl text-amber-300">"{ss.pattern}"</p>
        <p className="mt-2 text-sm text-white/45">Next puzzle starting…</p>
      </Center>
    )
  }

  // ---- someone else's turn ----
  if (!myTurn) {
    return (
      <Center>
        <p className="text-sm uppercase tracking-widest text-white/50">Now playing</p>
        <p className="pf-wordmark mt-1 text-4xl" style={{ color: PAL[players.find((p) => p.id === ss.turn)?.color ?? 'cyan'] }}>{nameOf(ss.turn)}</p>
        <p className="mt-3 text-white/60">Watch the TV — your turn is coming.</p>
        <p className="mt-6 text-sm text-white/50">Your banked score: <b className="text-cyan">{me.score}</b> · on the table: <b className="text-amber-300">{myTable}</b></p>
      </Center>
    )
  }

  // ---- my turn: solve input ----
  if (solving) {
    return (
      <div className="flex min-h-full flex-1 flex-col px-5 py-6">
        <div className="mb-3 flex items-center justify-between">
          <p className="pf-wordmark text-2xl text-p-lime">Solve it!</p>
          <TimerRing seconds={remaining} />
        </div>
        <p className="text-white/70">Type the full phrase. Wrong guess = your turn ends.</p>
        <p className="mt-3 rounded-card bg-white/5 px-3 py-2 text-center text-lg tracking-widest text-white/85">{ss.pattern}</p>
        <input
          autoFocus
          value={attempt}
          onChange={(e) => setAttempt(e.target.value.slice(0, 80))}
          onKeyDown={(e) => e.key === 'Enter' && submitSolve()}
          placeholder="Your answer…"
          className="pf-glass mt-4 rounded-card px-4 py-4 text-lg text-white placeholder-white/35 outline-none"
        />
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button onClick={() => setSolving(false)} className="pf-glass rounded-card py-4 font-semibold text-white/70">Back</button>
          <button
            onClick={submitSolve}
            disabled={!attempt.trim() || busy}
            className="rounded-card py-4 font-bold text-grape-900 disabled:opacity-40"
            style={{ background: 'linear-gradient(95deg,#84cc16,#06b6d4)' }}
          >Lock it in</button>
        </div>
      </div>
    )
  }

  // ---- my turn: pick a letter ----
  if (ss.wheel) {
    return (
      <div className="flex min-h-full flex-1 flex-col px-4 py-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="pf-wordmark text-xl text-amber-300">You spun {ss.wheel.value}{ss.fever ? ' ×2' : ''}</p>
          <TimerRing seconds={remaining} />
        </div>
        <p className="mb-3 text-white/70">Pick a letter. Every hit pays <b className="text-amber-300">{ss.wheel.value}{ss.fever ? ' ×2' : ''}</b>. Miss and the turn passes.</p>
        {flash && <p className="mb-2 text-sm text-p-rose">{flash}</p>}
        <div className="grid grid-cols-6 gap-1.5">
          {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((L) => {
            const used = ss.used_letters.includes(L)
            return (
              <button
                key={L}
                disabled={used || busy}
                onClick={() => act(async () => {
                  const r = await ssPick(room.id, L)
                  if (!r.ok && r.reason === 'used') setFlash('Already used — pick another')
                })}
                className={`grid h-12 place-items-center rounded-md text-xl font-bold ${used ? 'bg-white/5 text-white/20 line-through' : 'pf-glass text-white active:scale-95'}`}
              >{L}</button>
            )
          })}
        </div>
        <button onClick={() => setSolving(true)} className="mt-auto rounded-card py-3 text-sm font-semibold text-p-lime underline underline-offset-4">I know it — solve instead</button>
      </div>
    )
  }

  // ---- my turn: spin ----
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-6 text-center">
      <p className="text-sm uppercase tracking-widest text-p-lime">Your turn!</p>
      {ss.fever && <p className="mt-2 animate-pulse font-bold text-amber-300">FEVER — next letter pays DOUBLE</p>}
      <button
        onClick={() => act(() => ssSpin(room.id))}
        disabled={busy}
        className="mt-6 grid h-44 w-44 place-items-center rounded-full text-2xl font-extrabold text-grape-900 shadow-2xl transition active:scale-95 disabled:opacity-50"
        style={{ background: 'conic-gradient(#fbbf24,#f97316,#ec4899,#a855f7,#06b6d4,#84cc16,#fbbf24)' }}
      >
        <span className="grid h-36 w-36 place-items-center rounded-full bg-amber-300">
          <span className="flex flex-col items-center gap-1"><SpinnerWheelIcon size={34} /> SPIN</span>
        </span>
      </button>
      <button onClick={() => setSolving(true)} className="mt-8 rounded-card px-6 py-3 text-p-lime underline underline-offset-4">I know it — solve the puzzle</button>
      <div className="mt-6"><TimerRing seconds={remaining} /></div>
      <p className="mt-4 text-xs text-white/45">On the table: <b className="text-amber-300">{myTable}</b> — banks when the puzzle is solved. BANKRUPT wipes it!</p>
    </div>
  )

  async function submitSolve() {
    if (!attempt.trim()) return
    await act(async () => {
      const r = await ssSolve(room.id, attempt.trim())
      if (r.correct) sound.correct()
      setSolving(false)
    })
  }
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-full flex-1 flex-col items-center justify-center px-6 text-center">{children}</div>
}
