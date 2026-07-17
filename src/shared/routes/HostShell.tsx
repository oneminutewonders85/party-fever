import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import Stage from '../components/Stage'
import Wordmark from '../components/Wordmark'
import PlayerChip from '../components/PlayerChip'
import { ensureAnonSession } from '../lib/supabase'
import { closedReason, getRoomByCode, listPlayers, refreshRoom, startGame, subscribePlayers } from '../lib/room'
import { gameById } from '../lib/games'
import { getModule } from '../../games/registry'
import ExitButton from '../components/ExitButton'
import SoundToggle from '../components/SoundToggle'
import { sound } from '../lib/sound'
import type { Player, Room } from '../lib/types'

const LOBBY_MIN_FALLBACK = 2
const LOBBY_COUNTDOWN = 15

export default function HostShell() {
  const navigate = useNavigate()
  const { code = '' } = useParams()
  const [room, setRoom] = useState<Room | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [notFound, setNotFound] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [starting, setStarting] = useState(false)
  const started = useRef(false)

  const joinUrl = `${window.location.origin}/join/${code.toUpperCase()}`
  const game = room ? gameById(room.current_game) : undefined

  // Unlock audio on the first tap (covers a TV that loaded /host directly).
  useEffect(() => sound.armAutostart(), [])

  useEffect(() => {
    let unsub: (() => void) | undefined
    ;(async () => {
      await ensureAnonSession()
      const r = await getRoomByCode(code)
      if (!r) return setNotFound(true)
      setRoom(r)
      setPlayers(await listPlayers(r.id))
      unsub = subscribePlayers(r.id, setPlayers)
    })().catch(console.error)
    return () => unsub?.()
  }, [code])

  // Watch the room itself. A game can end without the host touching anything:
  // players quit until the room drops under the minimum and the server closes it.
  useEffect(() => {
    if (!room || (room.status !== 'playing' && room.status !== 'lobby')) return
    const id = window.setInterval(async () => {
      try {
        const r = await refreshRoom(room.id)
        if (!r) return
        // The server closes a room when quitters drop it under the game's
        // minimum. The TV has to leave too, or it sits on a dead game while
        // every phone has already gone home.
        if (r.status === 'closed') {
          const why = closedReason(r)
          navigate('/', {
            state: {
              notice: why === 'not_enough_players'
                ? 'The game closed because someone left and there were not enough players to carry on.'
                : 'The game was closed.',
            },
          })
          return
        }
        setRoom(r)
      } catch (e) { console.error(e) }
    }, 3000)
    return () => window.clearInterval(id)
  }, [room?.id, room?.status]) // eslint-disable-line react-hooks/exhaustive-deps

  async function begin() {
    if (started.current || !room) return
    started.current = true
    setStarting(true)
    try {
      const mod = getModule(room.current_game)
      if (mod?.start) await mod.start(room.id)
      else await startGame(room.id)
      setRoom(await refreshRoom(room.id))
    } catch (e) {
      console.error(e)
      started.current = false
      setStarting(false)
    }
  }

  // lobby countdown (TV is authority); auto-start at zero
  const startThreshold = game?.minPlayers ?? LOBBY_MIN_FALLBACK
  useEffect(() => {
    if (!room || room.status !== 'lobby') return
    const enough = players.length >= startThreshold
    setCountdown((c) => (enough ? (c === null ? LOBBY_COUNTDOWN : c) : null))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players.length, room?.status, startThreshold])

  useEffect(() => {
    if (countdown === null) return
    if (countdown <= 0) {
      begin()
      return
    }
    const t = window.setTimeout(() => setCountdown((c) => (c === null ? null : c - 1)), 1000)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown])

  if (notFound) {
    return (
      <Stage className="flex min-h-screen flex-col items-center justify-center text-center">
        <Wordmark size="md" />
        <p className="mt-6 text-2xl text-white/80">Room {code.toUpperCase()} isn’t open.</p>
        <a href="/" className="mt-4 text-cyan underline">Start a new game</a>
      </Stage>
    )
  }

  // in-game / finished -> hand off to the game module
  if (room && room.status !== 'lobby') {
    const mod = getModule(room.current_game)
    return (
      <Stage className="flex min-h-screen flex-col px-10 py-8">
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center">
          {mod ? <mod.HostView room={room} players={players} /> : <p>Unknown game.</p>}
        </div>
      </Stage>
    )
  }

  // lobby
  const SettingsPanel = room ? getModule(room.current_game)?.SettingsPanel : undefined
  return (
    <Stage className="flex min-h-screen flex-col px-10 py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ExitButton label="Exit" confirm="Close this room and return to the menu?" roomId={room?.id} />
            <Wordmark size="sm" />
          </div>
          <div className="flex items-center gap-3">
            <span className="pf-glass flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white/70">
              {game?.name ?? 'Quick Doodle'}
            </span>
            <SoundToggle />
          </div>
        </header>

        <div className="mt-8 grid grid-cols-1 gap-10 md:grid-cols-[auto,1fr]">
          <div className="flex flex-col items-center">
            <p className="mb-3 text-lg uppercase tracking-widest text-white/60">Scan to join</p>
            <div className="rounded-card bg-white p-5 shadow-2xl">
              <QRCodeSVG value={joinUrl} size={300} fgColor="#1a0b2e" />
            </div>
            <p className="mt-5 text-sm uppercase tracking-widest text-white/50">Room code</p>
            <p className="pf-wordmark text-6xl tracking-[.2em]">{code.toUpperCase()}</p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex items-baseline justify-between">
              <h2 className="pf-wordmark text-2xl text-white/80">Joined <span className="text-cyan">{players.length}</span></h2>
              {countdown !== null ? (
                <span className="pf-wordmark text-2xl text-p-lime animate-floaty">
                  {starting ? 'Starting…' : `Starting in ${countdown}s`}
                </span>
              ) : (
                <span className="text-white/50">Waiting for {Math.max(0, startThreshold - players.length)} more…</span>
              )}
            </div>

            <div className="flex flex-wrap content-start gap-3">
              {players.length === 0 && <p className="text-white/50">No one yet — scan the QR to jump in.</p>}
              {players.map((p) => <PlayerChip key={p.id} player={p} big />)}
            </div>

            {SettingsPanel && room && (
              <div className="max-w-md">
                <p className="mb-2 text-xs uppercase tracking-widest text-white/50">Host settings</p>
                <SettingsPanel room={room} />
              </div>
            )}
          </div>
        </div>

      </div>
    </Stage>
  )
}
