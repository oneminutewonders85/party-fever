import { supabase } from '../../shared/lib/supabase'
import type { GuessRow, RoundPublic, RoundResult } from '../../shared/lib/types'

// Returns the secret word ONLY to the current drawer (server-enforced).
export async function getMyWord(roundId: string): Promise<string> {
  const { data, error } = await supabase.rpc('get_my_word', { p_round_id: roundId })
  if (error) throw error
  return data as string
}

// Host flips revealing -> drawing and anchors the draw clock (draw_started_at).
export async function beginDrawing(roundId: string): Promise<void> {
  const { error } = await supabase.rpc('begin_drawing', { p_round_id: roundId })
  if (error) throw error
}

export interface GuessOutcome {
  is_correct: boolean
  solved: boolean // true only for the first correct guesser
}

export async function submitGuess(roundId: string, text: string): Promise<GuessOutcome> {
  const { data, error } = await supabase.rpc('submit_guess', { p_round_id: roundId, p_text: text })
  if (error) throw error
  return data as GuessOutcome
}

// Host call when the 2-minute clock expires with no winner (consolation +20).
export async function endTimeout(roundId: string): Promise<void> {
  const { error } = await supabase.rpc('end_round_timeout', { p_round_id: roundId })
  if (error) throw error
}

// Reveals word/outcome/winner — only valid once the round status is 'ended'.
export async function getRoundResult(roundId: string): Promise<RoundResult> {
  const { data, error } = await supabase.rpc('get_round_result', { p_round_id: roundId })
  if (error) throw error
  return data as RoundResult
}

// Host advances; returns the next round, or null when the game is finished.
export async function nextRound(roomId: string): Promise<RoundPublic | null> {
  const { data, error } = await supabase.rpc('next_round', { p_room_id: roomId })
  if (error) throw error
  return (data as RoundPublic) ?? null
}

export async function listGuesses(roundId: string): Promise<GuessRow[]> {
  const { data, error } = await supabase
    .from('guesses')
    .select('*')
    .eq('round_id', roundId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data as GuessRow[]) ?? []
}

export function subscribeGuesses(roundId: string, onChange: (rows: GuessRow[]) => void) {
  const ch = supabase
    .channel(`guesses:${roundId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'guesses', filter: `round_id=eq.${roundId}` },
      () => listGuesses(roundId).then(onChange).catch(console.error),
    )
    .subscribe()
  return () => {
    supabase.removeChannel(ch)
  }
}
