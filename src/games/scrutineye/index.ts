import type { GameModule } from '../../shared/lib/gameModule'
import ScrutineyeSettings from './ScrutineyeSettings'
import ScrutineyeHost from './ScrutineyeHost'
import ScrutineyePhone from './ScrutineyePhone'
import { seStart } from './api'

export const Scrutineye: GameModule = {
  id: 'scrutineye',
  SettingsPanel: ScrutineyeSettings,
  HostView: ScrutineyeHost,
  PhoneView: ScrutineyePhone,
  start: seStart,
}
