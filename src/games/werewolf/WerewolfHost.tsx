import { useEffect, useRef } from 'react'
import type { HostViewProps } from '../../shared/lib/gameModule'
import { openRoomChannel, type RoomChannel } from '../../shared/lib/realtime'
import { useLocalCountdown } from '../../shared/lib/useLocalCountdown'
import { sound } from '../../shared/lib/sound'
import { PAL, type Player } from '../../shared/lib/types'
import TimerRing from '../../shared/components/TimerRing'
import AdSlot from '../../shared/components/AdSlot'
import ExitButton from '../../shared/components/ExitButton'
import SoundToggle from '../../shared/components/SoundToggle'
import { useWw, wwAdvance } from './api'
import { NightScene, PlayerDot, ROLE_ACCENT, ROLE_LABEL, RoleIcon } from './ui'
import { MagnifierIcon, MoonIcon } from '../../shared/components/icons'
import type { WwPhase, WwRole } from './types'

const AUTO_PHASES: WwPhase[] = ['role_reveal', 'night', 'dawn', 'discussion', 'banishment']

export default function WerewolfHost({ room, players }: HostViewProps) {
  const chan = useRef<RoomChannel | null>(null)
  const syncCb = useRef<() => void>(() => {})
  const { room: live, ww } = useWw(room, (cb) => (syncCb.current = cb))
  const acted = useRef<Record<string, boolean>>({})
  const sfxFired = useRef<Record<string, boolean>>({})

  useEffect(() => {
    chan.current = openRoomChannel(room.join_code, { onSync: () => syncCb.current() })
    return () => chan.current?.cleanup()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.join_code])

  const phaseKey = ww ? `${ww.phase}:${ww.round}` : 'none'
  const remaining = useLocalCountdown(phaseKey, ww?.phase_len ?? 0)

  // host authority: advance when the phase clock runs out or everyone has acted
  useEffect(() => {
    if (!ww || !AUTO_PHASES.includes(ww.phase)) return
    const key = `${ww.phase}:${ww.round}`
    const allDone =
      (ww.phase === 'night' || ww.phase === 'discussion') &&
      ww.counts.total > 0 &&
      ww.counts.decided >= ww.counts.total
    if ((remaining <= 0 || allDone) && !acted.current[key]) {
      acted.current[key] = true
      wwAdvance(live.id, ww.phase)
        .then(() => {
          chan.current?.sendSync()
          syncCb.current()
        })
        .catch((e) => {
          console.error(e)
          acted.current[key] = false
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, ww?.phase, ww?.round, ww?.counts?.decided])

  // sfx on phase entry
  useEffect(() => {
    if (!ww) return
    const k = `${ww.phase}:${ww.round}`
    if (sfxFired.current[k]) return
    sfxFired.current[k] = true
    if (ww.phase === 'night') sound.night()
    if (ww.phase === 'dawn' && ww.night_result && ww.night_result.type !== 'saved') sound.eliminate()
    if (ww.phase === 'banishment') sound.eliminate()
    if (ww.phase === 'village_win') sound.correct()
    if (ww.phase === 'werewolf_win') sound.night()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ww?.phase, ww?.round])

  if (!ww) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-white/60">Dealing roles…</div>
    )
  }

  const living = players.filter((p) => ww.alive[p.id])
  const dead = players.filter((p) => !ww.alive[p.id])

  const corner = (
    <div className="mb-5 flex items-center justify-between">
      <ExitButton label="Exit" confirm="End this game and return to the menu?" />
      <span className="pf-wordmark text-lg text-white/60">Round {ww.round}</span>
      <SoundToggle />
    </div>
  )

  // ---- per-phase screens ----
  if (ww.phase === 'role_reveal') {
    return (
      <div className="mx-auto max-w-5xl">
        {corner}
        <NightScene>
          <div className="text-center">
            <h1 className="pf-wordmark text-5xl text-white">THE VILLAGE SLEEPS…</h1>
            <p className="mt-3 text-xl text-white/70">Check your phones for your secret role</p>
            <p className="mt-2 text-sm text-white/40">Roles are dealt in secret — nothing is shown here</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {players.map((p) => (
                <span key={p.id} className="pf-glass grid h-14 w-14 place-items-center rounded-card text-indigo-200"><MoonIcon size={26} /></span>
              ))}
            </div>
          </div>
        </NightScene>
      </div>
    )
  }

  if (ww.phase === 'night') {
    return (
      <div className="mx-auto max-w-5xl">
        {corner}
        <NightScene>
          <div className="text-center">
            <h1 className="pf-wordmark text-5xl text-white">Night falls over the village</h1>
            <p className="mt-3 text-xl text-white/75">Everyone, decide on your phones.</p>
            <div className="mt-8 flex justify-center"><TimerRing seconds={remaining} /></div>
            <p className="mt-6 text-lg text-white/60">{ww.counts.decided} of {ww.counts.total} have decided</p>
            <div className="mt-4 flex justify-center gap-2">
              {Array.from({ length: ww.counts.total }).map((_, i) => (
                <span key={i} className={`h-3 w-3 rounded-full ${i < ww.counts.decided ? 'bg-cyan' : 'bg-white/20'}`} />
              ))}
            </div>
          </div>
        </NightScene>
        <AdSlot size="billboard" className="mt-8" />
      </div>
    )
  }

  if (ww.phase === 'dawn') {
    const nr = ww.night_result
    const headline =
      nr?.type === 'saved'
        ? 'The werewolf struck… but someone was saved in the night'
        : nr?.type === 'killed_doctor'
          ? `The werewolf struck down the Doctor — ${nr?.name}`
          : `${nr?.name} was found gone`
    return (
      <div className="mx-auto max-w-4xl text-center">
        {corner}
        <p className="text-lg uppercase tracking-[.3em] text-amber-300/80">Dawn breaks over the village</p>
        <h1 className="pf-wordmark mt-4 text-5xl text-white">{headline}</h1>
        {ww.empowered_killed && (
          <p className="mt-4 text-xl text-white/60">The village rallied behind them… and it cost them.</p>
        )}
        <p className="mt-10 pf-wordmark inline-flex items-center gap-2 text-2xl text-p-lime">Now — find the werewolf <MagnifierIcon size={24} /></p>
      </div>
    )
  }

  if (ww.phase === 'discussion') {
    return (
      <div className="mx-auto max-w-6xl">
        {corner}
        <NightScene>
          <div className="text-center">
            <h1 className="pf-wordmark text-5xl text-white">Who's the werewolf?</h1>
            <p className="mx-auto mt-3 max-w-2xl text-lg text-white/70">
              Discuss amongst yourselves who the werewolf is — and boot them out. Get it wrong, and another innocent may fall.
            </p>
            <div className="mt-6 flex justify-center"><TimerRing seconds={remaining} /></div>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {living.map((p) => (
                <div key={p.id} className="pf-glass flex items-center gap-2 rounded-card px-4 py-3">
                  <PlayerDot player={p} size={16} /> <span className="text-lg font-medium">{p.name}</span>
                </div>
              ))}
            </div>
            {dead.length > 0 && (
              <div className="mt-6">
                <p className="text-xs uppercase tracking-widest text-white/40">Lost so far</p>
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  {dead.map((p) => (
                    <span key={p.id} className="rounded-card bg-white/5 px-3 py-1 text-sm text-white/40 line-through">{p.name}</span>
                  ))}
                </div>
              </div>
            )}
            <p className="mt-6 text-white/50">{ww.counts.decided} of {ww.counts.total} have voted</p>
          </div>
        </NightScene>
      </div>
    )
  }

  if (ww.phase === 'banishment') {
    const br = ww.banish_result
    const roleLine =
      br?.role === 'werewolf' ? 'the WEREWOLF!' : br?.role === 'doctor' ? 'the Doctor' : 'a Villager'
    return (
      <div className="mx-auto max-w-4xl text-center">
        {corner}
        <p className="text-lg uppercase tracking-[.3em] text-amber-300/80">The village has spoken</p>
        <h1 className="pf-wordmark mt-4 text-5xl text-white">{br?.name} is banished</h1>
        <p className="mt-3 text-2xl" style={{ color: br ? ROLE_ACCENT[br.role] : '#fff' }}>…{roleLine}</p>
        {br?.tie && <p className="mt-2 text-white/50">The vote was split — the werewolf slips away.</p>}
        {!br?.game_over && <p className="mt-4 text-white/70">The werewolf still walks. The village must try again.</p>}
        {ww.tally && (
          <div className="mx-auto mt-8 max-w-md">
            <p className="mb-2 text-xs uppercase tracking-widest text-white/40">Vote tally</p>
            <Tally tally={ww.tally} players={players} />
          </div>
        )}
      </div>
    )
  }

  // win states
  const win = ww.phase === 'village_win'
  return (
    <div className="mx-auto max-w-3xl text-center">
      <div className="mb-4 flex justify-center"><ExitButton label="Back to games" /></div>
      <h1 className="pf-wordmark text-6xl" style={{ color: win ? '#84cc16' : '#ef4444' }}>
        {win ? 'The village wins!' : 'The werewolf wins'}
      </h1>
      <p className="mt-3 text-xl text-white/70">
        {win ? 'The werewolf was ' : 'It was '}
        {players.filter((p) => ww.roles?.[p.id] === 'werewolf').map((p) => p.name).join(' & ')}
        {win ? '' : ' all along'}
      </p>
      <div className="mt-8">
        <p className="mb-3 text-xs uppercase tracking-widest text-white/40">Everyone's role</p>
        <div className="flex flex-col gap-2">
          {players.map((p) => {
            const role = ww.roles?.[p.id] as WwRole | undefined
            return (
              <div key={p.id} className="pf-glass flex items-center gap-3 rounded-card px-4 py-2">
                <span className="h-3 w-3 rounded-full" style={{ background: PAL[p.color] }} />
                <span className="flex-1 text-left">{p.name}</span>
                {role && <span className="inline-flex items-center gap-2" style={{ color: ROLE_ACCENT[role] }}><RoleIcon role={role} size={20} /> {ROLE_LABEL[role]}</span>}
              </div>
            )
          })}
        </div>
      </div>
      <AdSlot size="billboard" className="mt-10" />
    </div>
  )
}

function Tally({ tally, players }: { tally: Record<string, number>; players: Player[] }) {
  const rows = Object.entries(tally)
    .map(([id, n]) => ({ p: players.find((x) => x.id === id), n }))
    .filter((r) => r.p)
    .sort((a, b) => b.n - a.n)
  return (
    <div className="flex flex-col gap-2">
      {rows.map(({ p, n }) => (
        <div key={p!.id} className="pf-glass flex items-center gap-3 rounded-card px-4 py-2">
          <PlayerDot player={p!} size={14} />
          <span className="flex-1 text-left">{p!.name}</span>
          <span className="pf-wordmark text-cyan">{n}</span>
        </div>
      ))}
    </div>
  )
}

