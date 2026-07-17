import type { GameModule } from '../../shared/lib/gameModule'
import SpinSpellSettings from './SpinSpellSettings'
import SpinSpellHost from './SpinSpellHost'
import SpinSpellPhone from './SpinSpellPhone'
import { ssStart } from './api'

export const SpinSpell: GameModule = {
  id: 'spin_spell',
  SettingsPanel: SpinSpellSettings,
  HostView: SpinSpellHost,
  PhoneView: SpinSpellPhone,
  start: ssStart,
}
