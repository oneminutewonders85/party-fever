import type { FC } from 'react'
import type { GameId, Player, Room } from './types'

// The contract each game implements. The host/phone shells render these once a
// game is in progress; new games = a new module + RPCs, no shell changes.
export interface HostViewProps {
  room: Room
  players: Player[]
}
export interface PhoneViewProps {
  room: Room
  me: Player
  players: Player[]
}
export interface SettingsPanelProps {
  room: Room
}

export interface GameModule {
  id: GameId
  SettingsPanel: FC<SettingsPanelProps>
  HostView: FC<HostViewProps>
  PhoneView: FC<PhoneViewProps>
}
