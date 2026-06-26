import type { GameId } from '../shared/lib/types'
import type { GameModule } from '../shared/lib/gameModule'
import { QuickDoodle } from './quick_doodle'

// The active game modules. Games 2–5 register here once built; the shells and
// shared plumbing don't change.
const MODULES: Partial<Record<GameId, GameModule>> = {
  quick_doodle: QuickDoodle,
}

export const getModule = (id: GameId): GameModule | undefined => MODULES[id]
