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
// History, because this function has been wrong twice:
//
//   v1 trusted getSession(). getSession() hands back whatever is in
//   localStorage without proving it still works, so an overnight-stale session
//   was returned as if healthy and every RPC after it failed on a rejected JWT.
//   The failure cleared storage as a side effect, so the NEXT load signed in
//   fresh and worked. That was the "first visit of the day errors" bug.
//
//   v2 fixed that but added signOut() before signInAnonymously(). That threw
//   away a session BEFORE knowing a replacement was obtainable. Anonymous
//   sign-ins are rate limited (30/hour/IP by default, which a few test phones
//   on one wifi burn through quickly), so once the limit was hit there was no
//   session and no way to get one: every reload burned more quota and failed
//   harder.
//
// v3: never discard credentials we cannot replace. signInAnonymously() already
// overwrites the stored session, so the signOut was redundant as well as
// dangerous. Errors now say what actually went wrong instead of being swallowed.
export async function ensureAnonSession(): Promise<Session> {
  let session: Session | null = null
  try {
    const { data } = await supabase.auth.getSession()
    session = data.session ?? null
  } catch {
    session = null
  }

  // Refresh anything expired or nearly so. If the refresh fails we fall through
  // to a fresh sign-in, but we do NOT tear down what we have on the way.
  if (session) {
    const expMs = (session.expires_at ?? 0) * 1000
    const stale = !session.expires_at || expMs - Date.now() < 60_000
    if (stale) {
      try {
        const { data, error } = await supabase.auth.refreshSession()
        if (!error && data.session) session = data.session
        else session = null
      } catch {
        session = null
      }
    }
  }

  if (!session) {
    const { data, error } = await supabase.auth.signInAnonymously()
    if (error) {
      // Surface the real reason. Rate limiting is the likely one during heavy
      // testing, and it is temporary, so say so rather than blaming the room.
      const msg = /rate|limit|429/i.test(error.message)
        ? 'Too many sign-ins from this network just now. Wait a minute and try again.'
        : `Could not start a session: ${error.message}`
      throw new Error(msg)
    }
    session = data.session ?? null
  }

  if (!session) throw new Error('Could not start an anonymous session')
  return session
}
