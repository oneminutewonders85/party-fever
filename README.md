# party-fever
Party gaming concept

# Party Fever — Quick Doodle

A multiplayer party game for **TV browser + players' phones**. Plain static
Vite + React + TS SPA, your own Supabase backend, hosted on Cloudflare Pages.
**No Lovable Cloud. No SSR. No Worker.**

Three routes, one codebase:
- `/` — home grid (TV)
- `/host/:code` — TV board
- `/join/:code` — phone controller

## Milestone 1 (this build): lobby + join flow
Home grid (Quick Doodle active, 4 locked) → create room → TV shows QR + code +
live roster + countdown → phones join with name + colour (taken colours disabled
live) → "You're in!" waiting screen. Proves the whole infra spine end-to-end.
Gameplay (drawing canvas, guessing, scoring, reveal, leaderboard) is Milestone 2.

---

## Setup (do these in order)

### 1. Supabase (your own project)
1. Create a project in **your** Supabase account (free tier).
2. **Authentication → Providers → enable "Anonymous Sign-Ins".** (No login screen.)
3. **SQL Editor → New query →** paste all of `supabase/schema.sql` → **Run**.
4. **Project Settings → API →** copy the **Project URL** and the
   **publishable** (or anon) **key**.

### 2. GitHub
Push this folder to your own repo (do not commit `.env.local`):
```
git init && git add . && git commit -m "Party Fever — Quick Doodle M1"
git branch -M main
git remote add origin https://github.com/<you>/party-fever.git
git push -u origin main
```

### 3. Cloudflare Pages
1. Pages → **Connect to Git** → pick the repo.
2. Framework preset **Vite**, build command `npm run build`, output dir `dist`.
3. **Settings → Environment variables** → add for Production *and* Preview:
   - `VITE_SUPABASE_URL` = your Project URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = your publishable/anon key
4. Deploy. `public/_redirects` already handles SPA deep links (`/host/*`, `/join/*`).

### 4. Test loop
Open the `*.pages.dev` URL on a TV/laptop → **Play now** on Quick Doodle →
scan the QR on 2–3 phones → join with different colours → watch the roster and
countdown update live on the TV.

---

## Local dev (optional, needs Node 18+)
```
cp .env.example .env.local   # fill in your two VITE_ vars
npm install
npm run dev
```

## Stack
React 18 · react-router-dom · @supabase/supabase-js · qrcode.react · Tailwind ·
Vite (static). Capacitor-ready for a later Play Store wrapper — players still
join via the web QR.
