import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../shared/lib/supabase'
import { refreshRoom } from '../../shared/lib/room'
import type { Room } from '../../shared/lib/types'

export type SePhase = 'play' | 'reveal' | 'finished'
export interface SePublic {
  phase: SePhase
  round: number
  total: number
  scene: string
  letters: string[]
  phase_started: string
  phase_len: number
  used_scenes: string[]
}

export const SCENE_LABEL: Record<string, string> = {
  park: 'The Zoo', beach: 'The Beach', theater: 'Backstage', railway: 'Victoria Station', hospital: 'The Hospital',
}

export async function seStart(roomId: string): Promise<void> {
  const { error } = await supabase.rpc('se_start', { p_room_id: roomId })
  if (error) throw error
}
export interface SeResult { ok: boolean; word?: string; score?: number; reason?: string }
export async function seSubmit(roomId: string, word: string): Promise<SeResult> {
  const { data, error } = await supabase.rpc('se_submit', { p_room_id: roomId, p_word: word })
  if (error) throw error
  return data as SeResult
}
export async function seAdvance(roomId: string, from: SePhase): Promise<void> {
  const { error } = await supabase.rpc('se_advance', { p_room_id: roomId, p_from: from })
  if (error) throw error
}

export function useSe(initial: Room, onSync?: (cb: () => void) => void) {
  const [room, setRoom] = useState<Room>(initial)
  const busy = useRef(false)
  const reload = async () => {
    if (busy.current) return
    busy.current = true
    try { const r = await refreshRoom(initial.id); if (r) setRoom(r) } finally { busy.current = false }
  }
  useEffect(() => {
    reload()
    const id = window.setInterval(reload, 1500)
    onSync?.(reload)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial.id])
  const se = (room.settings as { se?: SePublic }).se
  return { room, se, reload }
}
