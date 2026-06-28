import { useNavigate } from 'react-router-dom'

// Small, unobtrusive exit/back control. Confirms before leaving a live game so
// a stray tap doesn't abandon a room.
export default function ExitButton({
  label = 'Exit',
  confirm,
  to = '/',
}: {
  label?: string
  confirm?: string
  to?: string
}) {
  const navigate = useNavigate()
  function go() {
    if (confirm && !window.confirm(confirm)) return
    navigate(to)
  }
  return (
    <button
      onClick={go}
      className="pf-glass rounded-full px-4 py-2 text-sm text-white/70 transition hover:text-white"
    >
      ← {label}
    </button>
  )
}
