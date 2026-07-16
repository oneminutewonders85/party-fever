import { useEffect, useRef } from 'react'
import { TrophyIcon } from '../../shared/components/icons'
import type { HostViewProps } from '../../shared/lib/gameModule'
import { openRoomChannel, type RoomChannel } from '../../shared/lib/realtime'
import { useLocalCountdown } from '../../shared/lib/useLocalCountdown'
import { sound } from '../../shared/lib/sound'
import TimerRing from '../../shared/components/TimerRing'
import Scoreboard from '../../shared/components/Scoreboard'
import ExitButton from '../../shared/components/ExitButton'
import SoundToggle from '../../shared/components/SoundToggle'
import { cuAdvance, itemSrc, THEME_LABEL, useCu, type CuPhase } from './api'

const AUTO: CuPhase[] = ['build', 'reveal']

function Sequence({ theme, colors, orientation }: { theme: string; colors: string[]; orientation: 'h' | 'v' }) {
  const n = colors.length || 1
  // Size each item off the viewport so the WHOLE stack fits without cropping.
  // Vertical: cap total height at ~62vh (leaving room for header, prompt, timer);
  // horizontal: cap total width at ~86vw. min() also caps the per-item size so a
  // short row on a huge screen doesn't look comical.
  const itemSize =
    orientation === 'v'
      ? `min(200px, calc((62vh - ${(n - 1) * 12}px) / ${n}), 26vw)`
      : `min(200px, calc((86vw - ${(n - 1) * 12}px) / ${n}), 30vh)`
  return (
    <div className={`flex ${orientation === 'v' ? 'flex-col' : 'flex-row'} items-center justify-center gap-3`}>
      {colors.map((c, i) => (
        <img
          key={i}
          src={itemSrc(theme, c)}
          alt={c}
          style={{ width: itemSize, height: itemSize }}
          className="drop-shadow-lg"
        />
      ))}
    </div>
  )
}

export default function CupsHost({ room, players }: HostViewProps) {
  const chan = useRef<RoomChannel | null>(null)
  const syncCb = useRef<() => void>(() => {})
  const { cu } = useCu(room, (cb) => (syncCb.current = cb))
  const acted = useRef<Record<string, boolean>>({})

  useEffect(() => {
    chan.current = openRoomChannel(room.join_code, { onSync: () => syncCb.current() })
    return () => chan.current?.cleanup()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.join_code])

  const phaseKey = cu ? `${cu.phase}:${cu.round}` : 'none'
  const remaining = useLocalCountdown(phaseKey, cu?.phase_len ?? 0)

  useEffect(() => {
    if (!cu || !AUTO.includes(cu.phase)) return
    if (remaining <= 0 && !acted.current[phaseKey]) {
      acted.current[phaseKey] = true
      cuAdvance(room.id, cu.phase).then(() => { chan.current?.sendSync(); syncCb.current() }).catch((e) => {
        console.error(e); acted.current[phaseKey] = false
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, cu?.phase, cu?.round])

  useEffect(() => {
    if (cu?.phase === 'reveal') sound.correct()
    if (cu?.phase === 'build') sound.roundStart()
  }, [cu?.phase, cu?.round])

  if (!cu) return <div className="grid min-h-[60vh] place-items-center text-white/60">Stacking cups…</div>

  if (cu.phase === 'finished') {
    const ranked = [...players].sort((a, b) => b.score - a.score)
    return (
      <div className="flex min-h-[86vh] flex-col items-center justify-center text-center">
        <div className="absolute left-10 top-8">
          <ExitButton label="Back to games" roomId={room.id} />
        </div>
        <h1 className="pf-wordmark text-7xl text-white">Final scores!</h1>
        {ranked[0] && <p className="mt-4 inline-flex items-center gap-3 text-4xl text-p-lime"><TrophyIcon size={40} /> {ranked[0].name} wins with {ranked[0].score}</p>}
        <div className="mt-10 w-full max-w-2xl"><Scoreboard players={players} size="lg" /></div>
      </div>
    )
  }

  const reveal = cu.phase === 'reveal'

  return (
    <div className="flex min-h-[86vh] flex-col">
      <div className="flex items-center justify-between">
        <ExitButton label="Exit" confirm="End this game for everyone and return to the menu?" roomId={room.id} />
        <span className="pf-wordmark text-2xl text-white/60">Round {cu.round} of {cu.total}</span>
        <SoundToggle />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center overflow-hidden text-center">
        <p className="mb-1 text-sm uppercase tracking-[0.3em] text-white/50">
          {THEME_LABEL[cu.theme] ?? cu.theme} · {cu.orientation === 'v' ? 'stacked' : 'in a row'}
        </p>
        <p className="mb-4 pf-wordmark text-3xl text-white lg:text-4xl">Match this on your phone, then BUZZ!</p>
        <Sequence theme={cu.theme} colors={cu.target} orientation={cu.orientation} />
        {!reveal && <div className="mt-5 flex justify-center"><TimerRing seconds={remaining} /></div>}
        {reveal && (
          <p className="mt-5 pf-wordmark text-4xl text-p-lime lg:text-5xl">
            {cu.won ? `${cu.winner_name} matched it first! +100` : 'Nobody matched in time!'}
          </p>
        )}
      </div>
    </div>
  )
}
