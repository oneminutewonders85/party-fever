import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../shared/lib/supabase'
import { refreshRoom } from '../../shared/lib/room'
import type { Room } from '../../shared/lib/types'

export type QzPhase = 'question' | 'reveal' | 'finished'
export interface QzPublic {
  phase: QzPhase
  q: number
  total: number
  difficulty: string
  question: string
  options: string[]
  phase_started: string
  phase_len: number
  answer?: number
  fact?: string
  n_correct?: number
  answered?: number
}

// Kahoot-style colour + shape per option slot (consistent host & phone).
export const OPTS = [
  { color: '#e8443b', shape: '▲', name: 'red' },
  { color: '#2f6df0', shape: '◆', name: 'blue' },
  { color: '#e8b21e', shape: '●', name: 'gold' },
  { color: '#23a559', shape: '■', name: 'green' },
]

export async function qzStart(roomId: string): Promise<void> {
  const { error } = await supabase.rpc('qz_start', { p_room_id: roomId })
  if (error) throw error
}
export interface QzAnswerResult { ok: boolean; locked?: boolean; reason?: string }
export async function qzAnswer(roomId: string, choice: number): Promise<QzAnswerResult> {
  const { data, error } = await supabase.rpc('qz_answer', { p_room_id: roomId, p_choice: choice })
  if (error) throw error
  return data as QzAnswerResult
}
export async function qzAdvance(roomId: string, from: QzPhase): Promise<void> {
  const { error } = await supabase.rpc('qz_advance', { p_room_id: roomId, p_from: from })
  if (error) throw error
}
export async function qzAbort(roomId: string): Promise<void> {
  const { error } = await supabase.rpc('qz_abort', { p_room_id: roomId })
  if (error) throw error
}

export function useQz(initial: Room, onSync?: (cb: () => void) => void) {
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
  const qz = (room.settings as { qz?: QzPublic }).qz
  return { room, qz, reload }
}
