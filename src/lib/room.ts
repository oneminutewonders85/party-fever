import { supabase } from './supabase'
import type { ColorKey, Player, Room } from './types'

// All writes go through SECURITY DEFINER RPCs; reads use RLS-guarded selects.

export async function createRoom(): Promise<Room> {
  const { data, error } = await supabase.rpc('create_room')
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
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('room_id', roomId)
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
