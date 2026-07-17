import { createClient, type Session } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !key) {
  // Surfaced clearly so a missing Cloudflare env var is obvious, not silent.
  console.error(
    '[Party Fever] Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY. ' +
      'Set both in .env.local (dev) and in the Cloudflare Pages dashboard (prod).',
  )
}

export const supabase = createClient(url ?? '', key ?? '', {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
})

// Anonymous Auth: no login screen, works in a webview, gives every player a
// real auth.uid() for RLS. Enable "Anonymous Sign-Ins" in the Supabase dashboard.
//
// This used to be a one-liner that trusted getSession(). That was the cause of
// the "first visit of the day shows an error, the second works" bug:
//
//   getSession() hands back whatever is in localStorage. It does not prove the
//   session still works. Leave a tab shut overnight and the access token
//   expires; if the stored refresh token is also dead (rotated away, or the
//   anonymous user was cleaned up server side) then the old code happily
//   returned that corpse of a session and every RPC after it failed with a
//   rejected JWT. The failure cleared the stored session as a side effect, so
//   the *next* page load found nothing, signed in fresh, and worked. Hence the
//   daily "error once, then fine" pattern.
//
// So: check the expiry, refresh deliberately, and if the refresh will not fly,
// throw the dead session away and start a clean one.
export async function ensureAnonSession(): Promise<Session> {
  let session: Session | null = null
  try {
    const { data } = await supabase.auth.getSession()
    session = data.session ?? null
  } catch {
    session = null
  }

  // Refresh anything expired or about to expire. The 60s margin means we never
  // hand a token to a caller that dies mid-request.
  if (session) {
    const expMs = (session.expires_at ?? 0) * 1000
    const stale = !session.expires_at || expMs - Date.now() < 60_000
    if (stale) {
      try {
        const { data, error } = await supabase.auth.refreshSession()
        session = error ? null : data.session ?? null
      } catch {
        session = null
      }
    }
  }

  // No usable session. Clear any dead credentials out of storage first,
  // otherwise a poisoned refresh token can survive and break the next load too.
  if (!session) {
    try { await supabase.auth.signOut({ scope: 'local' }) } catch { /* nothing to clear */ }
    const { data, error } = await supabase.auth.signInAnonymously()
    if (error) throw error
    session = data.session ?? null
    if (!session) {
      const { data: after } = await supabase.auth.getSession()
      session = after.session ?? null
    }
  }

  if (!session) throw new Error('Could not start an anonymous session')
  return session
}
