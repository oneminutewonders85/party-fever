import { useEffect, useRef, useState } from 'react'
import type { PhoneViewProps } from '../../shared/lib/gameModule'
import { openRoomChannel, type RoomChannel } from '../../shared/lib/realtime'
import { useLocalCountdown } from '../../shared/lib/useLocalCountdown'
import { sound } from '../../shared/lib/sound'
import type { Player } from '../../shared/lib/types'
import TimerRing from '../../shared/components/TimerRing'
import { useWw, wwGetMe, wwNightTarget, wwSubmitAction, wwSubmitVote } from './api'
import { PlayerPicker, ROLE_ACCENT, ROLE_ICON, ROLE_LABEL } from './ui'
import type { WwMe } from './types'

export default function WerewolfPhone({ room, me, players }: PhoneViewProps) {
  const syncCb = useRef<() => void>(() => {})
  const chan = useRef<RoomChannel | null>(null)
  const { ww } = useWw(room, (cb) => (syncCb.current = cb))
  const [role, setRole] = useState<WwMe | null>(null)
  const [hideRole, setHideRole] = useState(false)
  const [pick, setPick] = useState<string | null>(null)
  const [locked, setLocked] = useState(false)
  const [partner, setPartner] = useState<{ name: string | null; target: string | null }>({ name: null, target: null })

  useEffect(() => {
    chan.current = openRoomChannel(room.join_code, { onSync: () => syncCb.current() })
    return () => chan.current?.cleanup()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.join_code])

  // (re)fetch my secret role whenever the phase or round changes (covers doctor reassignment)
  useEffect(() => {
    wwGetMe(room.id).then(setRole).catch(console.error)
    setPick(null)
    setLocked(false)
    setHideRole(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ww?.phase, ww?.round])

  // werewolf: poll the shared kill target so partners can coordinate
  useEffect(() => {
    if (ww?.phase !== 'night' || role?.role !== 'werewolf') return
    const poll = () =>
      wwNightTarget(room.id)
        .then((t) => setPartner({ name: t.partner_name, target: t.partner_target }))
        .catch(() => {})
    poll()
    const id = window.setInterval(poll, 1500)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ww?.phase, role?.role])

  const phaseKey = ww ? `${ww.phase}:${ww.round}` : 'none'
  const remaining = useLocalCountdown(phaseKey, ww?.phase_len ?? 0)
  const nameOf = (id?: string | null) => players.find((p) => p.id === id)?.name ?? 'someone'
  const alive = ww ? ww.alive[me.id] !== false : true

  if (!ww || !role) {
    return <Center><p className="text-white/60">Dealing roles…</p></Center>
  }

  // ghost / spectator (persistent once eliminated)
  if (!alive && ww.phase !== 'village_win' && ww.phase !== 'werewolf_win') {
    return (
      <Center>
        <p className="text-5xl opacity-40">👻</p>
        <h1 className="pf-wordmark mt-3 text-3xl text-white/70">You've been eliminated</h1>
        <p className="mt-2 text-white/50">Stay and watch it unfold — no peeking, no helping!</p>
      </Center>
    )
  }

  const accent = ROLE_ACCENT[role.role]

  // ---- role reveal ----
  if (ww.phase === 'role_reveal') {
    if (hideRole) {
      return <Center><p className="text-white/60">Role hidden. Watch the TV…</p>
        <button onClick={() => setHideRole(false)} className="pf-glass mt-4 rounded-card px-4 py-2 text-sm">Peek again</button></Center>
    }
    return (
      <div className="flex min-h-full flex-col items-center justify-center px-6 text-center"
        style={{ background: `radial-gradient(120% 70% at 50% 0%, ${accent}33, transparent)` }}>
        <p className="text-6xl">{ROLE_ICON[role.role]}</p>
        <h1 className="pf-wordmark mt-3 text-4xl" style={{ color: accent }}>You are the {ROLE_LABEL[role.role]}</h1>
        <p className="mt-3 text-white/75">{roleBlurb(role.role)}</p>
        {role.role === 'werewolf' && role.partner_name && (
          <p className="mt-2 text-white/60">Your fellow werewolf is <b>{role.partner_name}</b>.</p>
        )}
        <p className="mt-6 text-sm text-p-lime">Shield your screen 🙈</p>
        <button onClick={() => setHideRole(true)} className="pf-glass mt-4 rounded-card px-6 py-3 font-medium">Got it — hide</button>
      </div>
    )
  }

  // ---- night actions ----
  if (ww.phase === 'night') {
    const cfg = nightConfig(role.role)
    if (locked) {
      return <Center>
        <p className="pf-wordmark text-2xl" style={{ color: accent }}>Decision locked.</p>
        <p className="mt-2 text-white/60">Watch the TV.</p>
        <div className="mt-6"><TimerRing seconds={remaining} /></div>
      </Center>
    }
    async function submit() {
      if (!pick) return
      try { await wwSubmitAction(room.id, cfg.kind, pick); setLocked(true); syncCb.current() }
      catch (e) { console.error(e) }
    }
    const selectable = (p: Player) => {
      if (ww!.alive[p.id] === false) return false
      if (cfg.kind === 'save') return true // incl self
      if (p.id === me.id) return false
      if (cfg.kind === 'kill' && partner && p.id === partnerId(players, partner.name)) return false
      return true
    }
    return (
      <div className="flex min-h-full flex-col px-5 py-6">
        <div className="mb-2 flex items-center justify-between">
          <p className="pf-wordmark text-xl" style={{ color: accent }}>{ROLE_ICON[role.role]} {ROLE_LABEL[role.role]}</p>
          <TimerRing seconds={remaining} />
        </div>
        <p className="mb-4 text-white/80">{cfg.prompt}</p>
        {role.role === 'werewolf' && partner.target && (
          <p className="mb-3 text-sm text-p-rose">Your partner wants <b>{nameOf(partner.target)}</b>.</p>
        )}
        <PlayerPicker players={players} selectable={selectable} selectedId={pick} onSelect={setPick}
          accent={accent} selfId={me.id} allowSelfLabel={cfg.kind === 'save' ? 'Save myself' : undefined} />
        <button onClick={submit} disabled={!pick}
          className="mt-5 rounded-card px-6 py-4 font-bold text-grape-900 disabled:opacity-40"
          style={{ background: accent }}>
          {pick ? `${cfg.verb} ${nameOf(pick)}` : cfg.verb}
        </button>
      </div>
    )
  }

  // ---- dawn (passive) ----
  if (ww.phase === 'dawn') {
    const nr = ww.night_result
    const msg = nr?.type === 'saved' ? 'Someone was saved in the night.'
      : nr?.type === 'killed_doctor' ? `The Doctor (${nr?.name}) was lost.`
        : `${nr?.name} was found gone.`
    return <Center><h1 className="pf-wordmark text-3xl">Morning breaks…</h1>
      <p className="mt-2 text-white/70">{msg}</p><p className="mt-1 text-sm text-white/45">Look up at the TV.</p></Center>
  }

  // ---- discussion / accusation vote ----
  if (ww.phase === 'discussion') {
    if (locked) {
      return <Center><p className="pf-wordmark text-2xl text-cyan">Vote locked</p>
        <p className="mt-2 text-white/60">You chose {nameOf(pick)}</p>
        <div className="mt-6"><TimerRing seconds={remaining} /></div></Center>
    }
    async function vote() {
      if (!pick) return
      try { await wwSubmitVote(room.id, pick); sound.init(); setLocked(true); syncCb.current() }
      catch (e) { console.error(e) }
    }
    return (
      <div className="flex min-h-full flex-col px-5 py-6">
        <div className="mb-2 flex items-center justify-between">
          <p className="pf-wordmark text-2xl">Who's the werewolf?</p>
          <TimerRing seconds={remaining} />
        </div>
        <p className="mb-2 text-white/70">Talk it out — then lock your vote. Choose wrong and another innocent may die.</p>
        {role.empowered && (
          <p className="mb-3 rounded-card px-3 py-2 text-sm" style={{ background: '#fbbf2422', color: '#fbbf24' }}>
            The village rallied behind you — your vote counts double this round.
          </p>
        )}
        <PlayerPicker players={players} accent="#ef4444" selectedId={pick} onSelect={setPick}
          selectable={(p) => ww.alive[p.id] !== false && p.id !== me.id} />
        <button onClick={vote} disabled={!pick}
          className="mt-5 rounded-card px-6 py-4 font-bold text-grape-900 disabled:opacity-40"
          style={{ background: 'linear-gradient(95deg,#ef4444,#fbbf24)' }}>
          {pick ? `Banish ${nameOf(pick)}` : 'Vote to banish'}
        </button>
      </div>
    )
  }

  // ---- banishment (passive) ----
  if (ww.phase === 'banishment') {
    return <Center><h1 className="pf-wordmark text-3xl">{ww.banish_result?.name} is banished</h1>
      <p className="mt-2 text-white/60">Look up at the TV.</p></Center>
  }

  // ---- end ----
  const iWin = (ww.phase === 'village_win' && role.role !== 'werewolf') || (ww.phase === 'werewolf_win' && role.role === 'werewolf')
  return (
    <Center>
      <h1 className="pf-wordmark text-4xl" style={{ color: iWin ? '#84cc16' : '#ef4444' }}>
        {iWin ? 'Your side wins! 🎉' : 'Your side lost'}
      </h1>
      <p className="mt-2 text-white/70">You were the {ROLE_LABEL[role.role]} {ROLE_ICON[role.role]}</p>
      <p className="mt-1 text-sm text-white/45">{ww.phase === 'village_win' ? 'The village prevailed.' : 'The werewolf prevailed.'}</p>
    </Center>
  )
}

function partnerId(players: Player[], partnerName: string | null): string | null {
  return players.find((p) => p.name === partnerName)?.id ?? null
}
function roleBlurb(role: WwMe['role']) {
  return role === 'werewolf' ? 'Hunt in secret. Don’t get caught.'
    : role === 'doctor' ? 'Protect the village — you can even save yourself.'
      : 'Find the werewolf before it’s too late.'
}
function nightConfig(role: WwMe['role']): { kind: 'kill' | 'save' | 'empower'; prompt: string; verb: string } {
  if (role === 'werewolf') return { kind: 'kill', prompt: "It's night and you're hungry. Decide who to kill.", verb: 'Strike' }
  if (role === 'doctor') return { kind: 'save', prompt: 'The werewolf might strike anyone. Decide who to save.', verb: 'Protect' }
  return { kind: 'empower', prompt: 'Select a leader to empower your charge — but beware: if you pick the werewolf, they grow stronger and get an assured kill.', verb: 'Empower' }
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-full flex-1 flex-col items-center justify-center px-6 text-center">{children}</div>
}
