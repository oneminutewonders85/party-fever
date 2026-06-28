import type { GameModule } from '../../shared/lib/gameModule'
import QuizzardsSettings from './QuizzardsSettings'
import QuizzardsHost from './QuizzardsHost'
import QuizzardsPhone from './QuizzardsPhone'
import { qzStart } from './api'

export const Quizzards: GameModule = {
  id: 'quizzards',
  SettingsPanel: QuizzardsSettings,
  HostView: QuizzardsHost,
  PhoneView: QuizzardsPhone,
  start: qzStart,
}
