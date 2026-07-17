import { useRef, useState } from 'react'
import { useHybridSync } from '../../shared/lib/useHybridSync'
import { supabase } from '../../shared/lib/supabase'
import { refreshRoom } from '../../shared/lib/room'
import type { Room } from '../../shared/lib/types'

export type SsPhase = 'turn' | 'reveal' | 'finished'

export interface SsLast {
  type: 'spin' | 'letter' | 'solve' | 'solve_fail' | 'timeout'
  seg?: number
  value?: number
  label?: 'bankrupt' | 'lose_turn' | 'fever'
  letter?: string
  occ?: number
  pts?: number
  by?: string
}

export interface SsPublic {
  phase: SsPhase
  round: number
  total: number
  category: string
  pattern: string // '_' for hidden letters; spaces & punctuation shown
  used_letters: string[]
  order: string[]
  turn: string // player id
  wheel: { seg: number; value: number } | null
  fever: boolean
  round_pts: Record<string, number>
  phase_started: string
  phase_len: number
  last: SsLast | null
  solved_by: string | null
}

export async function ssStart(roomId: string): Promise<void> {
  const { error } = await supabase.rpc('ss_start', { p_room_id: roomId })
  if (error) throw error
}
export async function ssSetRounds(roomId: string, rounds: number): Promise<void> {
  const { error } = await supabase.rpc('ss_set_rounds', { p_room_id: roomId, p_rounds: rounds })
  if (error) throw error
}
export async function ssSpin(roomId: string): Promise<{ ok: boolean; seg: number }> {
  const { data, error } = await supabase.rpc('ss_spin', { p_room_id: roomId })
  if (error) throw error
  return data as { ok: boolean; seg: number }
}
export async function ssPick(roomId: string, letter: string): Promise<{ ok: boolean; occ?: number; reason?: string }> {
  const { data, error } = await supabase.rpc('ss_pick', { p_room_id: roomId, p_letter: letter })
  if (error) throw error
  return data as { ok: boolean; occ?: number; reason?: string }
}
export async function ssSolve(roomId: string, text: string): Promise<{ ok: boolean; correct: boolean }> {
  const { data, error } = await supabase.rpc('ss_solve', { p_room_id: roomId, p_text: text })
  if (error) throw error
  return data as { ok: boolean; correct: boolean }
}
export async function ssTimeout(roomId: string): Promise<void> {
  const { error } = await supabase.rpc('ss_timeout', { p_room_id: roomId })
  if (error) throw error
}
export async function ssAdvance(roomId: string, from: SsPhase): Promise<void> {
  const { error } = await supabase.rpc('ss_advance', { p_room_id: roomId, p_from: from })
  if (error) throw error
}
export async function ssAbort(roomId: string): Promise<void> {
  const { error } = await supabase.rpc('ss_abort', { p_room_id: roomId })
  if (error) throw error
}

export function useSs(initial: Room, onSync?: (cb: () => void) => void) {
  const [room, setRoom] = useState<Room>(initial)
  const busy = useRef(false)
  const reload = async () => {
    if (busy.current) return
    busy.current = true
    try { const r = await refreshRoom(initial.id); if (r) setRoom(r) } finally { busy.current = false }
  }
  onSync?.(reload)
  useHybridSync(reload, 'calm', initial.id)
  const ss = (room.settings as { ss?: SsPublic }).ss
  return { room, ss, reload }
}
