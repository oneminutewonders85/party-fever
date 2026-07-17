import { useNavigate } from 'react-router-dom'
import { closeRoom } from '../lib/room'

// Exit/back control. Confirms before leaving a live game, and — when given the
// roomId — closes the room server-side so every connected phone returns to its
// home screen automatically.
export default function ExitButton({
  label = 'Exit',
  confirm,
  to = '/',
  roomId,
}: {
  label?: string
  confirm?: string
  to?: string
  roomId?: string
}) {
  const navigate = useNavigate()
  async function go() {
    if (confirm && !window.confirm(confirm)) return
    if (roomId) { try { await closeRoom(roomId) } catch { /* best effort */ } }
    navigate(to)
  }
  return (
    <button
      onClick={go}
      className="pf-glass rounded-full px-5 py-2.5 text-base font-semibold text-white/75 transition hover:text-white"
    >
      ← {label}
    </button>
  )
}
