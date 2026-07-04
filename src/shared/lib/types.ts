// Shared domain types for Party Fever.
// Per-game state lives in `settings`/`state` JSONB so all 5 games share the
// rooms/players/scoring plumbing.

export type GameId = 'quick_doodle' | 'spin_spell' | 'cups' | 'scrutineye' | 'quizzards' | 'werewolf'

export type RoomStatus = 'lobby' | 'playing' | 'finished' | 'closed'

export interface Room {
  id: string
  join_code: string
  host_uid: string
  current_game: GameId
  status: RoomStatus
  settings: RoomSettings
  created_at: string
}

export interface RoomSettings {
  rounds?: number
  difficulty?: 'easy' | 'moderate' | 'pro'
  [k: string]: unknown
}

export interface Player {
  id: string
  room_id: string
  auth_uid: string
  name: string
  color: ColorKey
  score: number
  is_connected: boolean
  joined_at: string
}

// The 12 player colours, keyed. We store the KEY in players.color and map to
// hex in the UI, so the unique(room_id, color) constraint is stable.
export const PAL = {
  red: '#ef4444',
  blue: '#3b82f6',
  yellow: '#eab308',
  green: '#22c55e',
  purple: '#a855f7',
  orange: '#f97316',
  pink: '#ec4899',
  teal: '#14b8a6',
  indigo: '#6366f1',
  lime: '#84cc16',
  cyan: '#06b6d4',
  rose: '#f43f5e',
} as const

export type ColorKey = keyof typeof PAL
export const COLOR_KEYS = Object.keys(PAL) as ColorKey[]

// ---- Gameplay (Milestone 2) ----------------------------------------------

export type Difficulty = 'easy' | 'moderate' | 'pro'

export interface RoomSettingsM2 extends RoomSettings {
  rounds_per_player?: number
  difficulty?: Difficulty
  order?: string[]        // snapshot of player ids in draw order (set at start_game)
  total_rounds?: number
}

export type RoundStatus = 'revealing' | 'drawing' | 'ended'

// Word-free projection of a round (from the rounds_public view). The secret
// word is NEVER present here — only get_my_word()/get_round_result() expose it.
export interface RoundPublic {
  id: string
  room_id: string
  round_no: number
  drawer_id: string | null
  status: RoundStatus
  started_at: string | null
  ended_at: string | null
  winner_id: string | null
  outcome: 'guessed' | 'timeout' | null
  draw_started_at?: string | null
}

export interface RoundResult {
  word: string
  outcome: 'guessed' | 'timeout' | null
  winner_id: string | null
  winner_name: string | null
  drawer_id: string | null
}

export interface GuessRow {
  id: string
  round_id: string
  player_id: string
  text: string
  is_correct: boolean
  created_at: string
}

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: 'Easy',
  moderate: 'Moderate',
  pro: 'Pro',
}
