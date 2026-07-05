import type { ColorKey } from './types'
import { COLOR_KEYS } from './types'

// The phone remembers who you are, so joining a game is just: scan the QR.
const KEY = 'pf_profile_v1'

export interface Profile {
  name: string
  color: ColorKey
}

export function loadProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as Partial<Profile>
    if (typeof p.name !== 'string' || !p.name.trim()) return null
    if (!COLOR_KEYS.includes(p.color as ColorKey)) return null
    return { name: p.name.trim().slice(0, 16), color: p.color as ColorKey }
  } catch {
    return null
  }
}

export function saveProfile(p: Profile): void {
  try { localStorage.setItem(KEY, JSON.stringify({ name: p.name.trim().slice(0, 16), color: p.color })) } catch { /* private mode */ }
}

export function clearProfile(): void {
  try { localStorage.removeItem(KEY) } catch { /* ignore */ }
}
