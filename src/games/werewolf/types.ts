// Public, non-secret game state lives in rooms.settings.ww (pollable).
export type WwPhase =
  | 'role_reveal'
  | 'night'
  | 'dawn'
  | 'discussion'
  | 'banishment'
  | 'village_win'
  | 'werewolf_win'

export type WwRole = 'werewolf' | 'doctor' | 'villager'

export interface WwElim {
  id: string
  role: WwRole
  how: 'night' | 'vote'
}

export interface WwPublic {
  phase: WwPhase
  round: number
  phase_started: string
  phase_len: number
  n_wolves: number
  alive: Record<string, boolean>
  eliminated: WwElim[]
  night_result: { type: 'killed' | 'killed_doctor' | 'saved'; name?: string } | null
  empowered_killed: boolean
  banish_result: { name: string; role: WwRole; tie: boolean; game_over: 'village' | 'werewolf' | null } | null
  tally: Record<string, number> | null
  counts: { decided: number; total: number }
  roles: Record<string, WwRole> | null
}

export interface WwMe {
  player_id: string
  role: WwRole
  alive: boolean
  empowered: boolean
  partner_name: string | null
}

export interface WwNightTarget {
  my_target: string | null
  partner_id: string | null
  partner_name: string | null
  partner_target: string | null
}
