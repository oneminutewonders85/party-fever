import { supabase } from './supabase'
import type { ColorKey, GameId, Player, Room } from './types'

// All writes go through SECURITY DEFINER RPCs; reads use RLS-guarded selects.

export async function createRoom(game: GameId = 'quick_doodle'): Promise<Room> {
  const { data, error } = await supabase.rpc('create_room', { p_game: game })
  if (error) throw error
  return data as Room
}

export async function getRoomByCode(code: string): Promise<Room | null> {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('join_code', code.toUpperCase())
    .maybeSingle()
  if (error) throw error
  return (data as Room) ?? null
}

export async function joinRoom(
  code: string,
  name: string,
  color: ColorKey,
): Promise<Player> {
  const { data, error } = await supabase.rpc('join_room', {
    p_code: code.toUpperCase(),
    p_name: name,
    p_color: color,
  })
  if (error) throw error
  return data as Player
}

export async function listPlayers(roomId: string): Promise<Player[]> {
  // Players who quit stay in the table (five tables reference them) but must not
  // appear in lobbies, scoreboards or turn order.
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('room_id', roomId)
    .is('left_at', null)
    .order('joined_at', { ascending: true })
  if (error) throw error
  return (data as Player[]) ?? []
}

// Returns this device's existing player in a room (if it already joined), so a
// QR re-scan resumes instead of forcing a re-join.
export async function myPlayer(roomId: string): Promise<Player | null> {
  const { data: sess } = await supabase.auth.getSession()
  const uid = sess.session?.user.id
  if (!uid) return null
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('room_id', roomId)
    .eq('auth_uid', uid)
    .is('left_at', null)
    .maybeSingle()
  if (error) throw error
  return (data as Player) ?? null
}

// Live roster via Postgres Changes. Re-fetches the full list on any change to
// keep ordering/colours authoritative and simple.
export function subscribePlayers(roomId: string, onChange: (players: Player[]) => void) {
  const channel = supabase
    .channel(`players:${roomId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` },
      () => {
        listPlayers(roomId).then(onChange).catch(console.error)
      },
    )
    .subscribe()
  return () => {
    supabase.removeChannel(channel)
  }
}

// ---- Gameplay room-level helpers (Milestone 2) ---------------------------
import type { Difficulty, RoundPublic } from './types'

export async function setSettings(roomId: string, roundsPerPlayer: number, difficulty: Difficulty) {
  const { error } = await supabase.rpc('set_settings', {
    p_room_id: roomId,
    p_rounds_per_player: roundsPerPlayer,
    p_difficulty: difficulty,
  })
  if (error) throw error
}

export async function startGame(roomId: string): Promise<RoundPublic> {
  const { data, error } = await supabase.rpc('start_game', { p_room_id: roomId })
  if (error) throw error
  return data as RoundPublic
}

// The latest round for a room, word-free (from the rounds_public view).
export async function currentRound(roomId: string): Promise<RoundPublic | null> {
  const { data, error } = await supabase
    .from('rounds_public')
    .select('*')
    .eq('room_id', roomId)
    .order('round_no', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return (data as RoundPublic) ?? null
}

export async function refreshRoom(roomId: string): Promise<Room | null> {
  const { data, error } = await supabase.from('rooms').select('*').eq('id', roomId).maybeSingle()
  if (error) throw error
  return (data as Room) ?? null
}

// Host closes the room (TV exit). Phones polling the room see status 'closed'
// and return to their home screen.
export async function closeRoom(roomId: string): Promise<void> {
  const { error } = await supabase.rpc('close_room', { p_room_id: roomId })
  if (error) throw error
}

// A player quits. The server marks them as left, and decides whether the room
// can carry on: below the game's minimum it closes for everyone, otherwise play
// continues and this player is simply never given a turn again.
export async function leaveRoom(roomId: string): Promise<{ closed: boolean; remaining?: number }> {
  const { data, error } = await supabase.rpc('leave_room', { p_room_id: roomId })
  if (error) throw error
  const r = (data ?? {}) as { closed?: boolean; remaining?: number }
  return { closed: Boolean(r.closed), remaining: r.remaining }
}

// Why a room ended, when it ended by itself.
export function closedReason(room: Room | null | undefined): string | null {
  const s = room?.settings as Record<string, unknown> | undefined
  const v = s?.closed_reason
  return typeof v === 'string' ? v : null
}
