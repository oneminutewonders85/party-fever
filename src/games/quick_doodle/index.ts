import type { GameModule } from '../../shared/lib/gameModule'
import QuickDoodleSettings from './QuickDoodleSettings'
import DoodleHostView from './DoodleHostView'
import DoodlePhoneView from './DoodlePhoneView'

export const QuickDoodle: GameModule = {
  id: 'quick_doodle',
  SettingsPanel: QuickDoodleSettings,
  HostView: DoodleHostView,
  PhoneView: DoodlePhoneView,
}
