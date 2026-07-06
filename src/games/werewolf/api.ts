import { useRef, useState } from 'react'
import { useHybridSync } from '../../shared/lib/useHybridSync'
import { supabase } from '../../shared/lib/supabase'
import { refreshRoom } from '../../shared/lib/room'
import type { Room } from '../../shared/lib/types'
import type { WwMe, WwNightTarget, WwPhase, WwPublic } from './types'

export async function wwStart(roomId: string): Promise<void> {
  const { error } = await supabase.rpc('ww_start', { p_room_id: roomId })
  if (error) throw error
}
export async function wwGetMe(roomId: string): Promise<WwMe> {
  const { data, error } = await supabase.rpc('ww_get_me', { p_room_id: roomId })
  if (error) throw error
  return data as WwMe
}
export async function wwSubmitAction(roomId: string, kind: 'kill' | 'save' | 'empower', targetId: string): Promise<void> {
  const { error } = await supabase.rpc('ww_submit_action', { p_room_id: roomId, p_kind: kind, p_target_id: targetId })
  if (error) throw error
}
export async function wwNightTarget(roomId: string): Promise<WwNightTarget> {
  const { data, error } = await supabase.rpc('ww_night_target', { p_room_id: roomId })
  if (error) throw error
  return data as WwNightTarget
}
export async function wwSubmitVote(roomId: string, targetId: string): Promise<void> {
  const { error } = await supabase.rpc('ww_submit_vote', { p_room_id: roomId, p_target_id: targetId })
  if (error) throw error
}
export async function wwAdvance(roomId: string, fromPhase: WwPhase): Promise<void> {
  const { error } = await supabase.rpc('ww_advance', { p_room_id: roomId, p_from_phase: fromPhase })
  if (error) throw error
}

// Poll the room and surface the public ww state. Fast-path refetch is nudged by
// the room broadcast channel (the TV sends sync after every phase change).
export function useWw(initial: Room, onSync?: (cb: () => void) => void) {
  const [room, setRoom] = useState<Room>(initial)
  const reloading = useRef(false)
  const reload = async () => {
    if (reloading.current) return
    reloading.current = true
    try {
      const r = await refreshRoom(initial.id)
      if (r) setRoom(r)
    } finally {
      reloading.current = false
    }
  }
  onSync?.(reload)
  useHybridSync(reload, 'race', initial.id)
  const ww = (room.settings as { ww?: WwPublic }).ww
  return { room, ww, reload }
}
