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

  if (!se) return <div className="grid min-h-[60vh] place-items-center text-white/60">Loading scene…</div>

  const corner = (
    <div className="mb-4 flex items-center justify-between">
      <ExitButton label="Exit" confirm="End this game and return to the menu?" />
      <span className="pf-wordmark text-lg text-white/60">Round {se.round} of {se.total}</span>
      <SoundToggle />
    </div>
  )

  if (se.phase === 'finished') {
    const ranked = [...players].sort((a, b) => b.score - a.score)
    return (
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-4 flex justify-center"><ExitButton label="Back to games" /></div>
        <h1 className="pf-wordmark text-5xl text-white">Eyes on the prize!</h1>
        {ranked[0] && <p className="mt-3 text-2xl text-p-lime">🏆 {ranked[0].name} wins with {ranked[0].score}</p>}
        <div className="mt-8"><Scoreboard players={players} /></div>
        <AdSlot size="billboard" className="mt-10" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl">
      {corner}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.7fr,1fr]">
        <div>
          <div className="overflow-hidden rounded-card border border-white/10">
            <img src={`/scenes/${se.scene}.jpg`} alt="scene" className="w-full" />
          </div>
          <p className="mt-2 text-center text-sm uppercase tracking-widest text-white/40">{SCENE_LABEL[se.scene] ?? se.scene}</p>
        </div>
        <div className="flex flex-col gap-5">
          {se.phase === 'play' ? (
            <>
              <div className="text-center">
                <p className="mb-2 text-xs uppercase tracking-widest text-white/50">Find objects starting with</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {se.letters.map((L) => (
                    <span key={L} className="pf-wordmark grid h-14 w-14 place-items-center rounded-card bg-cyan text-2xl text-grape-900">{L}</span>
                  ))}
                </div>
                <div className="mt-4 flex justify-center"><TimerRing seconds={remaining} /></div>
              </div>
            </>
          ) : (
            <div className="pf-glass rounded-card p-5 text-center">
              <p className="pf-wordmark text-2xl text-p-lime">Round {se.round} complete!</p>
              <p className="mt-1 text-white/60">Next scene coming up…</p>
            </div>
          )}
          <div>
            <p className="mb-2 text-xs uppercase tracking-widest text-white/50">Scores</p>
            <Scoreboard players={players} />
          </div>
        </div>
      </div>
      {se.phase === 'play' && (
        <p className="mt-3 text-center text-sm text-white/40">Look closely and type what you spot on your phones. Specific finds score <b style={{ color: PAL.lime }}>20</b>, everyday things <b style={{ color: PAL.lime }}>10</b>.</p>
      )}
      <AdSlot size="billboard" className="mt-8" />
    </div>
  )
}
