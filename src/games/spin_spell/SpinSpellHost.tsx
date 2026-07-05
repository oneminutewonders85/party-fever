import { useEffect, useRef } from 'react'
import type { HostViewProps } from '../../shared/lib/gameModule'
import { openRoomChannel, type RoomChannel } from '../../shared/lib/realtime'
import { useLocalCountdown } from '../../shared/lib/useLocalCountdown'
import { sound } from '../../shared/lib/sound'
import { PAL } from '../../shared/lib/types'
import TimerRing from '../../shared/components/TimerRing'
import Scoreboard from '../../shared/components/Scoreboard'
import ExitButton from '../../shared/components/ExitButton'
import SoundToggle from '../../shared/components/SoundToggle'
import { TrophyIcon } from '../../shared/components/icons'
import { ssAdvance, ssTimeout, useSs, type SsLast } from './api'
import Wheel from './wheel'

export default function SpinSpellHost({ room, players }: HostViewProps) {
  const chan = useRef<RoomChannel | null>(null)
  const syncCb = useRef<() => void>(() => {})
  const { room: live, ss } = useSs(room, (cb) => (syncCb.current = cb))
  const acted = useRef<Record<string, boolean>>({})

  useEffect(() => {
    chan.current = openRoomChannel(room.join_code, { onSync: () => syncCb.current() })
    return () => chan.current?.cleanup()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.join_code])

  // one countdown per decision: keyed by phase+round+who's up+what state
  const phaseKey = ss ? `${ss.phase}:${ss.round}:${ss.turn}:${ss.wheel ? 'pick' : 'spin'}:${ss.used_letters.length}` : 'none'
  const remaining = useLocalCountdown(phaseKey, ss?.phase_len ?? 0)

  // host authority: time out a stalled turn / auto-leave the reveal screen
  useEffect(() => {
    if (!ss) return
    if (remaining > 0 || acted.current[phaseKey]) return
    acted.current[phaseKey] = true
    const call = ss.phase === 'turn' ? ssTimeout(live.id) : ss.phase === 'reveal' ? ssAdvance(live.id, 'reveal') : null
    call?.then(() => { chan.current?.sendSync(); syncCb.current() }).catch((e) => { console.error(e); acted.current[phaseKey] = false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, phaseKey])

  // sfx on notable events
  const sfxKey = useRef('')
  useEffect(() => {
    if (!ss?.last) return
    const k = JSON.stringify(ss.last)
    if (sfxKey.current === k) return
    sfxKey.current = k
    const l = ss.last
    if (l.type === 'spin' && l.label === 'bankrupt') sound.eliminate()
    else if (l.type === 'letter' && (l.occ ?? 0) > 0) sound.correct()
    else if (l.type === 'solve') sound.correct()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ss?.last])

  if (!ss) return <div className="grid min-h-[60vh] place-items-center text-white/60">Spinning up…</div>

  const nameOf = (id?: string | null) => players.find((p) => p.id === id)?.name ?? 'someone'
  const colorOf = (id?: string | null) => PAL[players.find((p) => p.id === id)?.color ?? 'cyan']

  // ---- finished ----
  if (ss.phase === 'finished') {
    const ranked = [...players].sort((a, b) => b.score - a.score)
    return (
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-4 flex justify-center"><ExitButton label="Back to games" roomId={live.id} /></div>
        <h1 className="pf-wordmark text-6xl text-p-lime">That's a wrap!</h1>
        {ranked[0] && (
          <p className="mt-4 inline-flex items-center gap-3 text-4xl text-p-lime">
            <TrophyIcon size={40} /> {ranked[0].name} wins with {ranked[0].score}
          </p>
        )}
        <div className="mt-8"><Scoreboard players={players} size="lg" /></div>
      </div>
    )
  }

  const feverOn = ss.fever
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-4 flex items-center justify-between">
        <ExitButton label="Exit" confirm="End this game for everyone and return to the menu?" roomId={live.id} />
        <span className="pf-wordmark text-lg text-white/60">Puzzle {ss.round} of {ss.total}</span>
        <SoundToggle />
      </div>

      <div className="grid grid-cols-[1fr_360px] gap-8">
        <div>
          {/* category + phrase board */}
          <p className="text-center text-lg font-bold uppercase tracking-[.35em] text-amber-300">{ss.category}</p>
          <PhraseBoard pattern={ss.pattern} solved={ss.phase === 'reveal'} />

          {/* wheel + status */}
          <div className="mt-6 grid grid-cols-[auto_1fr] items-center gap-8">
            <Wheel seg={ss.last?.type === 'spin' ? ss.last.seg ?? null : null} spinKey={JSON.stringify(ss.last)} size={380} />
            <div className="text-center">
              {ss.phase === 'reveal' ? (
                <>
                  <p className="pf-wordmark text-5xl text-p-lime">Solved!</p>
                  <p className="mt-2 text-2xl text-white/80"><b style={{ color: colorOf(ss.solved_by) }}>{nameOf(ss.solved_by)}</b> takes the round</p>
                </>
              ) : (
                <>
                  <p className="text-sm uppercase tracking-widest text-white/50">Now playing</p>
                  <p className="pf-wordmark mt-1 text-5xl" style={{ color: colorOf(ss.turn) }}>{nameOf(ss.turn)}</p>
                  <p className="mt-3 text-xl text-white/75">
                    {ss.wheel
                      ? <>Spun <b className="text-amber-300">{ss.wheel.value}</b> — pick a letter on your phone!</>
                      : 'Spin the wheel — or solve the puzzle'}
                  </p>
                  {feverOn && <p className="mt-2 animate-pulse text-lg font-bold text-amber-300">FEVER — next letter pays DOUBLE</p>}
                  <EventToast last={ss.last} nameOf={nameOf} />
                  <div className="mt-4 flex justify-center"><TimerRing seconds={remaining} /></div>
                </>
              )}
            </div>
          </div>

          {/* used letters */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5">
            {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((L) => {
              const used = ss.used_letters.includes(L)
              return (
                <span key={L} className={`grid h-9 w-9 place-items-center rounded-md text-lg font-bold ${used ? 'bg-white/5 text-white/25 line-through' : 'pf-glass text-white/85'}`}>{L}</span>
              )
            })}
          </div>
        </div>

        {/* scores: banked + this-round pending */}
        <div>
          <p className="mb-2 text-xs uppercase tracking-widest text-white/40">Scores</p>
          <Scoreboard players={players} />
          <p className="mb-2 mt-6 text-xs uppercase tracking-widest text-white/40">On the table this puzzle</p>
          <div className="flex flex-col gap-2">
            {[...players].sort((a, b) => (ss.round_pts[b.id] ?? 0) - (ss.round_pts[a.id] ?? 0)).map((p) => (
              <div key={p.id} className="pf-glass flex items-center gap-3 rounded-card px-4 py-2" style={ss.turn === p.id ? { outline: `2px solid ${PAL[p.color]}` } : undefined}>
                <span className="h-3 w-3 rounded-full" style={{ background: PAL[p.color] }} />
                <span className="flex-1 text-left">{p.name}</span>
                <span className="pf-wordmark text-xl text-amber-300">{ss.round_pts[p.id] ?? 0}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-white/40">Points bank when the puzzle is solved. BANKRUPT wipes your unbanked points!</p>
        </div>
      </div>
    </div>
  )
}

function PhraseBoard({ pattern, solved }: { pattern: string; solved: boolean }) {
  const words = pattern.split(' ')
  return (
    <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-3">
      {words.map((w, wi) => (
        <div key={wi} className="flex gap-1.5">
          {w.split('').map((ch, ci) => {
            const isSlot = ch === '_' || /[A-Za-z]/.test(ch)
            if (!isSlot) return <span key={ci} className="grid h-14 w-6 place-items-end pb-1 text-3xl text-white/70">{ch}</span>
            return (
              <span
                key={ci}
                className={`grid h-14 w-11 place-items-center rounded-md text-4xl font-extrabold ${ch === '_' ? 'bg-white/10' : solved ? 'bg-p-lime text-grape-900' : 'bg-white text-grape-900'}`}
                style={{ fontFamily: 'inherit' }}
              >
                {ch === '_' ? '' : ch}
              </span>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function EventToast({ last, nameOf }: { last: SsLast | null; nameOf: (id?: string | null) => string }) {
  if (!last) return null
  let msg: React.ReactNode = null
  if (last.type === 'spin' && last.label === 'bankrupt') msg = <span className="text-p-rose">BANKRUPT! {nameOf(last.by)} loses their table points</span>
  else if (last.type === 'spin' && last.label === 'lose_turn') msg = <span className="text-white/60">{nameOf(last.by)} loses a turn</span>
  else if (last.type === 'spin' && last.label === 'fever') msg = <span className="text-amber-300">{nameOf(last.by)} hit FEVER!</span>
  else if (last.type === 'letter' && (last.occ ?? 0) > 0) msg = <span className="text-p-lime">"{last.letter}" ×{last.occ} — +{last.pts} for {nameOf(last.by)}</span>
  else if (last.type === 'letter') msg = <span className="text-white/60">No "{last.letter}" — {nameOf(last.by)} passes the turn</span>
  else if (last.type === 'solve_fail') msg = <span className="text-p-rose">{nameOf(last.by)} guessed wrong!</span>
  else if (last.type === 'timeout') msg = <span className="text-white/50">{nameOf(last.by)} ran out of time</span>
  if (!msg) return null
  return <p className="mt-3 min-h-6 text-lg">{msg}</p>
}
