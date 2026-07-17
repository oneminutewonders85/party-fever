// Party Fever icon system — consistent inline SVGs replacing emoji.
// All icons take `size` (px) and inherit color via `currentColor` unless a
// fixed palette makes more sense (medals, confetti).

import type { WwRole } from '../../games/werewolf/types'

interface IconProps { size?: number; className?: string; color?: string }
const S = ({ size = 20 }: IconProps) => ({ width: size, height: size })

export function WolfIcon({ size = 20, className, color }: IconProps) {
  return (
    <svg {...S({ size })} viewBox="0 0 24 24" fill="none" className={className} style={color ? { color } : undefined}>
      <path d="M4 4l3.2 3.2M20 4l-3.2 3.2M4 4c0 3 .6 5.2 2 6.8M20 4c0 3-.6 5.2-2 6.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6 10.8C6 8.5 8.5 7 12 7s6 1.5 6 3.8c0 2.8-1.6 5.4-3.4 7.2L12 20.5 9.4 18c-1.8-1.8-3.4-4.4-3.4-7.2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="9.6" cy="11.6" r="1" fill="currentColor" />
      <circle cx="14.4" cy="11.6" r="1" fill="currentColor" />
      <path d="M12 14.4v1.4M10.8 16.6l1.2.9 1.2-.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function StethoscopeIcon({ size = 20, className, color }: IconProps) {
  return (
    <svg {...S({ size })} viewBox="0 0 24 24" fill="none" className={className} style={color ? { color } : undefined}>
      <path d="M5 3v5a5 5 0 0 0 10 0V3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M10 13v2.5a5 5 0 0 0 10 0v-1.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="20" cy="11.5" r="2.1" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 2.6h2M14 2.6h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function VillagerIcon({ size = 20, className, color }: IconProps) {
  return (
    <svg {...S({ size })} viewBox="0 0 24 24" fill="none" className={className} style={color ? { color } : undefined}>
      {/* straw hat + face: the humble villager */}
      <path d="M3 10h18M7 10c0-3 2.2-5 5-5s5 2 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="15.5" r="4.4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="10.4" cy="15" r=".9" fill="currentColor" />
      <circle cx="13.6" cy="15" r=".9" fill="currentColor" />
      <path d="M10.6 17.6c.9.7 1.9.7 2.8 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function RoleIcon({ role, size = 20, className, color }: IconProps & { role: WwRole }) {
  if (role === 'werewolf') return <WolfIcon size={size} className={className} color={color} />
  if (role === 'doctor') return <StethoscopeIcon size={size} className={className} color={color} />
  return <VillagerIcon size={size} className={className} color={color} />
}

export function GhostIcon({ size = 20, className, color }: IconProps) {
  return (
    <svg {...S({ size })} viewBox="0 0 24 24" fill="none" className={className} style={color ? { color } : undefined}>
      <path d="M5 11a7 7 0 0 1 14 0v9l-2.3-1.8L14.4 20l-2.4-1.8L9.6 20l-2.3-1.8L5 20v-9Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="9.5" cy="11" r="1.1" fill="currentColor" />
      <circle cx="14.5" cy="11" r="1.1" fill="currentColor" />
    </svg>
  )
}

export function MoonIcon({ size = 20, className, color }: IconProps) {
  return (
    <svg {...S({ size })} viewBox="0 0 24 24" fill="none" className={className} style={color ? { color } : undefined}>
      <path d="M20 13.5A8.5 8.5 0 1 1 10.5 4 6.8 6.8 0 0 0 20 13.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  )
}

export function MagnifierIcon({ size = 20, className, color }: IconProps) {
  return (
    <svg {...S({ size })} viewBox="0 0 24 24" fill="none" className={className} style={color ? { color } : undefined}>
      <circle cx="10.5" cy="10.5" r="6.2" stroke="currentColor" strokeWidth="1.9" />
      <path d="m15.3 15.3 5 5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  )
}

export function TrophyIcon({ size = 20, className, color = '#fbbf24' }: IconProps) {
  return (
    <svg {...S({ size })} viewBox="0 0 24 24" fill="none" className={className} style={{ color }}>
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M7 5H4v1.5A3.5 3.5 0 0 0 7.5 10M17 5h3v1.5A3.5 3.5 0 0 1 16.5 10" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 14v3M8.5 20h7M10 17h4l.6 3H9.4l.6-3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  )
}

export function CrownIcon({ size = 20, className, color = '#fbbf24' }: IconProps) {
  return (
    <svg {...S({ size })} viewBox="0 0 24 24" fill="none" className={className} style={{ color }}>
      <path d="M4 8.5 8 12l4-6 4 6 4-3.5V17a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17V8.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" fillOpacity=".18" />
    </svg>
  )
}

const MEDAL_COLORS = ['#fbbf24', '#cbd5e1', '#d97b45']
export function MedalIcon({ rank, size = 22, className }: IconProps & { rank: 0 | 1 | 2 }) {
  const c = MEDAL_COLORS[rank]
  return (
    <svg {...S({ size })} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M8 3h3l1.5 4L14 3h2l-2.6 6.2h-4L8 3Z" fill={c} opacity=".55" />
      <circle cx="12" cy="15" r="5.4" fill={c} opacity=".22" stroke={c} strokeWidth="1.8" />
      <text x="12" y="18.2" textAnchor="middle" fontSize="8.4" fontWeight="800" fill={c}>{rank + 1}</text>
    </svg>
  )
}

export function PencilIcon({ size = 20, className, color }: IconProps) {
  return (
    <svg {...S({ size })} viewBox="0 0 24 24" fill="none" className={className} style={color ? { color } : undefined}>
      <path d="m14.5 5 4.5 4.5L8.5 20 3.6 20.4 4 15.5 14.5 5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m12.8 6.7 4.5 4.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

export function EraserIcon({ size = 20, className, color }: IconProps) {
  return (
    <svg {...S({ size })} viewBox="0 0 24 24" fill="none" className={className} style={color ? { color } : undefined}>
      <path d="m8.5 19 -4.2-4.2a2 2 0 0 1 0-2.8L12 4.3a2 2 0 0 1 2.8 0l4.9 4.9a2 2 0 0 1 0 2.8L13 19H8.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M20.5 19H13M7.4 10.9l5.7 5.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function UndoIcon({ size = 20, className, color }: IconProps) {
  return (
    <svg {...S({ size })} viewBox="0 0 24 24" fill="none" className={className} style={color ? { color } : undefined}>
      <path d="M8 5 4 9l4 4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 9h10a6 6 0 0 1 0 12h-3" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  )
}

export function TrashIcon({ size = 20, className, color }: IconProps) {
  return (
    <svg {...S({ size })} viewBox="0 0 24 24" fill="none" className={className} style={color ? { color } : undefined}>
      <path d="M4 6.5h16M9.5 6.5V4.8A1.3 1.3 0 0 1 10.8 3.5h2.4a1.3 1.3 0 0 1 1.3 1.3v1.7M6.5 6.5 7.4 20h9.2l.9-13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 10.5v6M14 10.5v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function ShieldEyeIcon({ size = 20, className, color }: IconProps) {
  return (
    <svg {...S({ size })} viewBox="0 0 24 24" fill="none" className={className} style={color ? { color } : undefined}>
      <path d="M12 3 5 5.6v5.2c0 4.6 3 8 7 9.7 4-1.7 7-5.1 7-9.7V5.6L12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8.4 12s1.3-2.3 3.6-2.3S15.6 12 15.6 12s-1.3 2.3-3.6 2.3S8.4 12 8.4 12Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="m7 9 10 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function ConfettiIcon({ size = 20, className }: IconProps) {
  return (
    <svg {...S({ size })} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M6.5 12.5 3 21l8.5-3.5" stroke="#fbbf24" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M6.5 12.5c2.5.5 4.5 2.5 5 5" stroke="#fbbf24" strokeWidth="1.8" />
      <path d="M13 4.5c1.5 1.5.5 3-1 4.5" stroke="#06b6d4" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M17 9c2-.5 3.5.5 4 2.5" stroke="#ec4899" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="16" cy="4" r="1.1" fill="#84cc16" />
      <circle cx="20.5" cy="6.5" r="1" fill="#a855f7" />
      <circle cx="14.5" cy="13.5" r="1" fill="#ef4444" />
    </svg>
  )
}

export function SpinnerWheelIcon({ size = 20, className, color }: IconProps) {
  return (
    <svg {...S({ size })} viewBox="0 0 24 24" fill="none" className={className} style={color ? { color } : undefined}>
      <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 5v16M4.6 9.2l14.8 7.6M4.6 16.8 19.4 9.2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="13" r="1.6" fill="currentColor" />
      <path d="M12 1.5 10 4h4l-2-2.5Z" fill="currentColor" />
    </svg>
  )
}

export function SpeakerOnIcon({ size = 20, className, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M4 9v6h4l5 4V5L8 9H4Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function SpeakerOffIcon({ size = 20, className, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M4 9v6h4l5 4V5L8 9H4Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m16.5 9.5 5 5m0-5-5 5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
