import type { GameId } from './types'

export interface GameDef {
  id: GameId
  name: string
  tagline: string
  accent: string // hex used for the tile glow / accent
  icon: string   // emoji logo shown on the home grid tile
  active: boolean
  minPlayers: number
  maxPlayers: number
  defaultRounds: number
}

// The home grid. Only Quick Doodle is active; the rest are locked ("Coming soon").
// New games slot in here + a new round view + a new set of RPCs.
export const GAMES: GameDef[] = [
  {
    id: 'quick_doodle',
    name: 'Quick Doodle',
    tagline: 'Draw it. Guess it. Fast.',
    accent: '#06b6d4',
    icon: '✏️',
    active: true,
    minPlayers: 3,
    maxPlayers: 12,
    defaultRounds: 3,
  },
  {
    id: 'spin_spell',
    name: 'Spin & Spell',
    tagline: 'Spin, steal, solve the phrase.',
    accent: '#fbbf24',
    icon: '🎡',
    active: false,
    minPlayers: 2,
    maxPlayers: 8,
    defaultRounds: 3,
  },
  {
    id: 'cups',
    name: 'Cups',
    tagline: 'Match the stack. Hit the buzzer.',
    accent: '#84cc16',
    icon: '🥤',
    active: false,
    minPlayers: 2,
    maxPlayers: 8,
    defaultRounds: 5,
  },
  {
    id: 'scrutineye',
    name: 'Scrutineye',
    tagline: 'Spot every object you can.',
    accent: '#ec4899',
    icon: '👁️',
    active: false,
    minPlayers: 2,
    maxPlayers: 12,
    defaultRounds: 3,
  },
  {
    id: 'quizzards',
    name: 'Quizzards',
    tagline: 'Fast answers win.',
    accent: '#a855f7',
    icon: '🧙',
    active: false,
    minPlayers: 2,
    maxPlayers: 12,
    defaultRounds: 10,
  },
]

export const gameById = (id: GameId) => GAMES.find((g) => g.id === id)
