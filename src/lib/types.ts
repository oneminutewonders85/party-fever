// Shared domain types for Party Fever.
// Per-game state lives in `settings`/`state` JSONB so all 5 games share the
// rooms/players/scoring plumbing.

export type GameId = 'quick_doodle' | 'spin_spell' | 'cups' | 'scrutineye' | 'quizzards'

export type RoomStatus = 'lobby' | 'playing' | 'finished'

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
  difficulty?: 'easy' | 'medium' | 'hard'
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
