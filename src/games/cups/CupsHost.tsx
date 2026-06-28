import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { HostViewProps } from '../../shared/lib/gameModule'
import { openRoomChannel, type RoomChannel } from '../../shared/lib/realtime'
import { useLocalCountdown } from '../../shared/lib/useLocalCountdown'
import { sound } from '../../shared/lib/sound'
import TimerRing from '../../shared/components/TimerRing'
import Scoreboard from '../../shared/components/Scoreboard'
import AdSlot from '../../shared/components/AdSlot'
import SoundToggle from '../../shared/components/SoundToggle'
import { cuAbort, cuAdvance, itemSrc, THEME_LABEL, useCu, type CuPhase } from './api'

const AUTO: CuPhase[] = ['build', 'reveal']

function Sequence({ theme, colors, orientation, size = 130 }: { theme: string; colors: string[]; orientation: 'h' | 'v'; size?: number }) {
  return (
    <div className={`flex ${orientation === 'v' ? 'flex-col' : 'flex-row'} items-center justify-center gap-3`}>
      {colors.map((c, i) => (
        <img key={i} src={itemSrc(theme, c)} alt={c} style={{ width: size, height: size }} className="drop-shadow-lg" />
      ))}
    </div>
  )
}

export default function CupsHost({ room, players }: HostViewProps) {
  const navigate = useNavigate()
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

  async function exit() {
    if (!window.confirm('End this game and return to the menu?')) return
    try { await cuAbort(room.id) } catch (e) { console.error(e) }
    navigate('/')
  }

  if (!cu) return <div className="grid min-h-[60vh] place-items-center text-white/60">Stacking cups…</div>

  if (cu.phase === 'finished') {
    const ranked = [...players].sort((a, b) => b.score - a.score)
    return (
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-4 flex justify-center">
          <button onClick={() => navigate('/')} className="pf-glass rounded-full px-4 py-2 text-sm text-white/70 hover:text-white">← Back to games</button>
        </div>
        <h1 className="pf-wordmark text-5xl text-white">Final scores!</h1>
        {ranked[0] && <p className="mt-3 text-2xl text-p-lime">🏆 {ranked[0].name} wins with {ranked[0].score}</p>}
        <div className="mt-8"><Scoreboard players={players} /></div>
        <AdSlot size="billboard" className="mt-10" />
      </div>
    )
  }

  const reveal = cu.phase === 'reveal'

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={exit} className="pf-glass rounded-full px-4 py-2 text-sm text-white/70 hover:text-white">← Exit</button>
        <span className="pf-wordmark text-lg text-white/60">Round {cu.round} of {cu.total}</span>
        <SoundToggle />
      </div>

      <div className="pf-glass rounded-card px-6 py-8 text-center">
        <p className="mb-1 text-xs uppercase tracking-widest text-white/50">
          {THEME_LABEL[cu.theme] ?? cu.theme} · {cu.orientation === 'v' ? 'stacked' : 'in a row'}
        </p>
        <p className="mb-6 pf-wordmark text-2xl text-white">Match this sequence on your phone, then BUZZ!</p>
        <Sequence theme={cu.theme} colors={cu.target} orientation={cu.orientation} />
        {!reveal && <div className="mt-7 flex justify-center"><TimerRing seconds={remaining} /></div>}
        {reveal && (
          <p className="mt-6 pf-wordmark text-3xl text-p-lime">
            {cu.won ? `${cu.winner_name} matched it first! +100` : 'Nobody matched in time!'}
          </p>
        )}
      </div>

      <AdSlot size="billboard" className="mt-8" />
    </div>
  )
}
