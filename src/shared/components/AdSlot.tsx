// Reserved advertising space (phones only — the TV carries no ads). Renders children (real ad markup /
// <img> / <iframe>) when provided, otherwise a clearly-labelled placeholder so
// the layout reserves the exact footprint now. Standard IAB sizes via `size`.
const SIZES = {
  leaderboard: { w: 728, h: 90 },     // classic top/bottom banner
  billboard: { w: 970, h: 250 },      // large banner
  rectangle: { w: 300, h: 250 },      // sidebar block
  mobileBanner: { w: 320, h: 100 },   // phone home-screen banner
  interstitial: { w: 320, h: 480 },   // full-page phone ad between games
} as const

export default function AdSlot({
  size = 'leaderboard',
  className = '',
  children,
}: {
  size?: keyof typeof SIZES
  className?: string
  children?: React.ReactNode
}) {
  const { w, h } = SIZES[size]
  return (
    <div
      className={`mx-auto w-full ${className}`}
      style={{ maxWidth: w }}
      aria-label="advertisement"
    >
      <div
        className="grid place-items-center overflow-hidden rounded-card border border-dashed border-white/15 bg-white/[.04]"
        style={{ aspectRatio: `${w} / ${h}` }}
      >
        {children ?? (
          <span className="text-xs uppercase tracking-[.3em] text-white/25">Ad space · {w}×{h}</span>
        )}
      </div>
    </div>
  )
}
