import type { GameModule } from '../../shared/lib/gameModule'
import CupsSettings from './CupsSettings'
import CupsHost from './CupsHost'
import CupsPhone from './CupsPhone'
import { cuStart } from './api'

export const Cups: GameModule = {
  id: 'cups',
  SettingsPanel: CupsSettings,
  HostView: CupsHost,
  PhoneView: CupsPhone,
  start: cuStart,
}
