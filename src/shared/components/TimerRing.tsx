// A compact countdown pill. Turns amber under 30s, red + pulse under 10s.
export default function TimerRing({ seconds }: { seconds: number }) {
  const mm = Math.floor(seconds / 60)
  const ss = String(seconds % 60).padStart(2, '0')
  const color = seconds <= 10 ? '#f43f5e' : seconds <= 30 ? '#fbbf24' : '#ffffff'
  const glow = seconds <= 10 ? '0 0 30px rgba(244,63,94,.6)' : 'none'
  return (
    <span
      className="pf-wordmark tabular-nums"
      style={{ color, textShadow: glow }}
      aria-label={`${seconds} seconds left`}
    >
      {mm}:{ss}
    </span>
  )
}
