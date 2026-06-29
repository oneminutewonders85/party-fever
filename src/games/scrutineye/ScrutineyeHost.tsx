import { useEffect, useRef } from 'react'
import type { HostViewProps } from '../../shared/lib/gameModule'
import { openRoomChannel, type RoomChannel } from '../../shared/lib/realtime'
import { useLocalCountdown } from '../../shared/lib/useLocalCountdown'
import { sound } from '../../shared/lib/sound'
import { PAL } from '../../shared/lib/types'
import TimerRing from '../../shared/components/TimerRing'
import Scoreboard from '../../shared/components/Scoreboard'
import AdSlot from '../../shared/components/AdSlot'
import ExitButton from '../../shared/components/ExitButton'
import SoundToggle from '../../shared/components/SoundToggle'
import { SCENE_LABEL, seAdvance, useSe, type SePhase } from './api'

const AUTO: SePhase[] = ['play', 'reveal']

export default function ScrutineyeHost({ room, players }: HostViewProps) {
  const chan = useRef<RoomChannel | null>(null)
  const syncCb = useRef<() => void>(() => {})
  const { se } = useSe(room, (cb) => (syncCb.current = cb))
  const acted = useRef<Record<string, boolean>>({})

  useEffect(() => {
    chan.current = openRoomChannel(room.join_code, { onSync: () => syncCb.current() })
    return () => chan.current?.cleanup()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.join_code])

  const phaseKey = se ? `${se.phase}:${se.round}` : 'none'
  const remaining = useLocalCountdown(phaseKey, se?.phase_len ?? 0)

  useEffect(() => {
    if (!se || !AUTO.includes(se.phase)) return
    if (remaining <= 0 && !acted.current[phaseKey]) {
      acted.current[phaseKey] = true
      seAdvance(room.id, se.phase).then(() => { chan.current?.sendSync(); syncCb.current() }).catch((e) => {
        console.error(e); acted.current[phaseKey] = false
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, se?.phase, se?.round])

  useEffect(() => {
    if (se?.phase === 'reveal') sound.roundStart()
    if (se?.phase === 'finished') sound.correct()
  }, [se?.phase])

  if (!se) return <div className="grid min-h-[70vh] place-items-center text-2xl text-white/60">Loading scene…</div>

  if (se.phase === 'finished') {
    const ranked = [...players].sort((a, b) => b.score - a.score)
    return (
      <div className="flex min-h-[86vh] flex-col items-center justify-center text-center">
        <div className="absolute left-10 top-8"><ExitButton label="Back to games" /></div>
        <h1 className="pf-wordmark text-7xl text-white">Eyes on the prize!</h1>
        {ranked[0] && <p className="mt-4 text-4xl text-p-lime">🏆 {ranked[0].name} wins with {ranked[0].score}</p>}
        <div className="mt-10 w-full max-w-2xl"><Scoreboard players={players} size="lg" /></div>
        <AdSlot size="leaderboard" className="mt-10 w-full max-w-3xl" />
      </div>
    )
  }

  return (
    <div className="flex min-h-[86vh] flex-col">
      {/* top bar */}
      <div className="mb-5 flex items-center justify-between">
        <ExitButton label="Exit" confirm="End this game and return to the menu?" />
        <div className="text-center">
          <p className="pf-wordmark text-3xl text-white">{SCENE_LABEL[se.scene] ?? se.scene}</p>
          <p className="text-sm uppercase tracking-widest text-white/50">Round {se.round} of {se.total}</p>
        </div>
        <SoundToggle />
      </div>

      {/* hero: big scene + side panel */}
      <div className="flex flex-1 items-stretch gap-6">
        <div className="flex flex-1 items-center justify-center">
          <img
            src={`/scenes/${se.scene}.jpg`}
            alt="scene"
            className="max-h-[78vh] w-full rounded-card border border-white/10 object-contain shadow-2xl"
          />
        </div>

        <div className="flex w-[380px] flex-col gap-6">
          {se.phase === 'play' ? (
            <div className="pf-glass rounded-card p-6 text-center">
              <p className="mb-3 text-sm uppercase tracking-widest text-white/50">Find objects starting with</p>
              <div className="flex flex-wrap justify-center gap-3">
                {se.letters.map((L) => (
                  <span key={L} className="pf-wordmark grid h-20 w-20 place-items-center rounded-card bg-cyan text-4xl text-grape-900 shadow-lg">{L}</span>
                ))}
              </div>
              <div className="mt-6 flex justify-center"><TimerRing seconds={remaining} /></div>
              <p className="mt-4 text-sm text-white/40">
                Specific finds <b style={{ color: PAL.lime }}>+20</b> · everyday things <b style={{ color: PAL.lime }}>+10</b>
              </p>
            </div>
          ) : (
            <div className="pf-glass rounded-card p-8 text-center">
              <p className="pf-wordmark text-4xl text-p-lime">Round {se.round} done!</p>
              <p className="mt-2 text-xl text-white/60">Next scene coming up…</p>
            </div>
          )}
          <div className="flex-1">
            <p className="mb-3 text-sm uppercase tracking-widest text-white/50">Scores</p>
            <Scoreboard players={players} size="lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
