import type { GameModule } from '../../shared/lib/gameModule'
import WerewolfSettings from './WerewolfSettings'
import WerewolfHost from './WerewolfHost'
import WerewolfPhone from './WerewolfPhone'
import { wwStart } from './api'

export const Werewolf: GameModule = {
  id: 'werewolf',
  SettingsPanel: WerewolfSettings,
  HostView: WerewolfHost,
  PhoneView: WerewolfPhone,
  start: wwStart,
}
