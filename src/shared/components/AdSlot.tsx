import { useEffect, useRef } from 'react'
import { ADSENSE_CLIENT, AD_SLOTS, type AdSlotName } from '../lib/ads'

// Reserved advertising space (phones only — the TV carries no ads).
//
// Behaviour:
//  - If `slot` names a configured AdSense unit (a non-empty ID in ads.ts), a real
//    <ins class="adsbygoogle"> is rendered and pushed to AdSense.
//  - Otherwise (pre-approval, or a decorative use), a clearly-labelled placeholder
//    reserves the exact footprint so the layout never shifts when ads switch on.
const SIZES = {
  leaderboard: { w: 728, h: 90 },
  billboard: { w: 970, h: 250 },
  rectangle: { w: 300, h: 250 },
  mobileBanner: { w: 320, h: 100 },
  interstitial: { w: 320, h: 480 },
} as const

const SLOT_FOR_SIZE: Partial<Record<keyof typeof SIZES, AdSlotName>> = {
  mobileBanner: 'mobileBanner',
  interstitial: 'interstitial',
}

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
  const slotName = SLOT_FOR_SIZE[size]
  const slotId = slotName ? AD_SLOTS[slotName] : ''
  const live = Boolean(slotId) && !children

  const pushed = useRef(false)
  useEffect(() => {
    if (!live || pushed.current) return
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
      pushed.current = true
    } catch {
      /* AdSense script not ready yet; it fills on next load */
    }
  }, [live])

  return (
    <div className={`mx-auto w-full ${className}`} style={{ maxWidth: w }} aria-label="advertisement">
      <div
        className="grid place-items-center overflow-hidden rounded-card border border-dashed border-white/15 bg-white/[.04]"
        style={{ aspectRatio: `${w} / ${h}` }}
      >
        {live ? (
          <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', height: '100%' }}
            data-ad-client={ADSENSE_CLIENT}
            data-ad-slot={slotId}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : (
          children ?? (
            <span className="text-xs uppercase tracking-[.3em] text-white/25">Ad space · {w}×{h}</span>
          )
        )}
      </div>
    </div>
  )
}
