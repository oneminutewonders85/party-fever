import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../shared/lib/supabase'
import { refreshRoom } from '../../shared/lib/room'
import type { Room } from '../../shared/lib/types'

export type CuPhase = 'build' | 'reveal' | 'finished'
export interface CuPublic {
  phase: CuPhase
  round: number
  total: number
  theme: string
  orientation: 'h' | 'v'
  target: string[]
  start: string[]
  phase_started: string
  phase_len: number
  won?: boolean
  winner_name?: string
}

export const CU_COLORS: Record<string, string> = {
  red: '#ef4444', blue: '#3b82f6', green: '#22c55e', orange: '#f97316', yellow: '#f4c20d',
}
export const THEME_LABEL: Record<string, string> = {
  balloon: 'Balloons', bird: 'Birds on a wire', car: 'Parked cars', chair: 'Chairs',
  flower: 'Flowers', frog: 'Frogs', kite: 'Kites', tshirt: 'T-shirts',
}
export const itemSrc = (theme: string, color: string) => `/cups/${theme}-${color}.png`
export const cupSrc = (color: string) => `/cups/cup-${color}.png`

export async function cuStart(roomId: string): Promise<void> {
  const { error } = await supabase.rpc('cu_start', { p_room_id: roomId })
  if (error) throw error
}
export async function cuSetRounds(roomId: string, rounds: number): Promise<void> {
  const { error } = await supabase.rpc('cu_set_rounds', { p_room_id: roomId, p_rounds: rounds })
  if (error) throw error
}
export interface CuBuzzResult { ok: boolean; correct?: boolean; total?: number; reason?: string }
export async function cuBuzz(roomId: string, arrangement: string[], orientation: 'h' | 'v'): Promise<CuBuzzResult> {
  const { data, error } = await supabase.rpc('cu_buzz', {
    p_room_id: roomId, p_arrangement: arrangement, p_orientation: orientation,
  })
  if (error) throw error
  return data as CuBuzzResult
}
export async function cuAdvance(roomId: string, from: CuPhase): Promise<void> {
  const { error } = await supabase.rpc('cu_advance', { p_room_id: roomId, p_from: from })
  if (error) throw error
}
export async function cuAbort(roomId: string): Promise<void> {
  const { error } = await supabase.rpc('cu_abort', { p_room_id: roomId })
  if (error) throw error
}

export function useCu(initial: Room, onSync?: (cb: () => void) => void) {
  const [room, setRoom] = useState<Room>(initial)
  const busy = useRef(false)
  const reload = async () => {
    if (busy.current) return
    busy.current = true
    try { const r = await refreshRoom(initial.id); if (r) setRoom(r) } finally { busy.current = false }
  }
  useEffect(() => {
    reload()
    const id = window.setInterval(reload, 1200)
    onSync?.(reload)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial.id])
  const cu = (room.settings as { cu?: CuPublic }).cu
  return { room, cu, reload }
}
