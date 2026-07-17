// Google AdSense configuration for Party Fever.
//
// Ads appear on PHONE screens only. The TV renders no ad slots by design.
//
// The publisher ID is already active (verification snippet lives in index.html).
// The two slot IDs below are EMPTY until AdSense approves the site. Once approved:
//   1. AdSense dashboard -> Ads -> By ad unit -> Display ad
//   2. Create two units (a responsive banner, and a rectangle/interstitial)
//   3. Paste each unit's data-ad-slot number below.
// Until then, AdSlot shows its labelled placeholder (no broken/blank ads).

export const ADSENSE_CLIENT = 'ca-pub-9261445903624865'

// Paste the numeric slot IDs from AdSense here after approval, e.g. '1234567890'.
export const AD_SLOTS = {
  mobileBanner: '', // phone home-screen banner (320x100-ish, responsive)
  interstitial: '', // phone post-game full-page ad (rectangle/interstitial)
} as const

export type AdSlotName = keyof typeof AD_SLOTS
