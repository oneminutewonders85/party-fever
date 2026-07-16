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
export async function ensureAnonSession(): Promise<Session> {
  const { data } = await supabase.auth.getSession()
  if (data.session) return data.session
  const { error } = await supabase.auth.signInAnonymously()
  if (error) throw error
  const after = await supabase.auth.getSession()
  if (!after.data.session) throw new Error('Could not start an anonymous session')
  return after.data.session
}
