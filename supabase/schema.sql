-- ============================================================================
-- Party Fever — Supabase schema (Milestone 1: rooms, players, lobby/join)
-- Run this whole file in YOUR Supabase project: SQL Editor -> New query -> Run.
-- Prereq: Authentication -> Providers -> enable "Anonymous Sign-Ins".
-- Safe to re-run (idempotent where practical). Gameplay RPCs land in M2.
-- ============================================================================

create extension if not exists fuzzystrmatch;   -- levenshtein() for M2 guess matching

-- ----------------------------------------------------------------------------
-- Tables
-- ----------------------------------------------------------------------------
create table if not exists public.rooms (
  id           uuid primary key default gen_random_uuid(),
  join_code    text unique not null,
  host_uid     uuid not null,
  current_game text not null default 'quick_doodle',
  status       text not null default 'lobby',          -- lobby | playing | finished
  settings     jsonb not null default '{"rounds":3,"difficulty":"easy"}'::jsonb,
  created_at   timestamptz not null default now()
);

create table if not exists public.players (
  id           uuid primary key default gen_random_uuid(),
  room_id      uuid not null references public.rooms(id) on delete cascade,
  auth_uid     uuid not null,
  name         text not null,
  color        text not null,
  score        int  not null default 0,
  is_connected boolean not null default true,
  joined_at    timestamptz not null default now(),
  constraint players_color_chk check (color in
    ('red','blue','yellow','green','purple','orange','pink','teal','indigo','lime','cyan','rose')),
  unique (room_id, color),
  unique (room_id, auth_uid)
);

create table if not exists public.rounds (
  id         uuid primary key default gen_random_uuid(),
  room_id    uuid not null references public.rooms(id) on delete cascade,
  round_no   int not null,
  drawer_id  uuid references public.players(id) on delete set null,
  word       text not null,                -- NEVER client-readable (table locked below)
  status     text not null default 'pending', -- pending | revealing | drawing | ended
  started_at timestamptz,
  ended_at   timestamptz,
  winner_id  uuid references public.players(id) on delete set null,
  outcome    text                          -- guessed | timeout
);

create table if not exists public.guesses (
  id         uuid primary key default gen_random_uuid(),
  round_id   uuid not null references public.rounds(id) on delete cascade,
  player_id  uuid not null references public.players(id) on delete cascade,
  text       text not null,
  is_correct boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.words (
  id         uuid primary key default gen_random_uuid(),
  text       text not null,
  difficulty text not null check (difficulty in ('easy','medium','hard'))
);

-- ----------------------------------------------------------------------------
-- Row Level Security
--   rooms / players / guesses : readable by any authenticated player.
--   rounds / words            : LOCKED (no select) so the secret word can never
--                               reach the TV or other phones. Reads happen only
--                               through SECURITY DEFINER functions + the view.
--   All writes go through SECURITY DEFINER RPCs (which bypass RLS).
-- ----------------------------------------------------------------------------
alter table public.rooms    enable row level security;
alter table public.players  enable row level security;
alter table public.guesses  enable row level security;
alter table public.rounds   enable row level security;
alter table public.words    enable row level security;

drop policy if exists rooms_select   on public.rooms;
drop policy if exists players_select on public.players;
drop policy if exists guesses_select on public.guesses;
create policy rooms_select   on public.rooms   for select to authenticated using (true);
create policy players_select on public.players for select to authenticated using (true);
create policy guesses_select on public.guesses for select to authenticated using (true);
-- rounds + words: intentionally NO policies (locked).

-- Public projection of rounds WITHOUT the word. Runs with owner rights
-- (security_invoker = false) so it can read the locked table, exposing only
-- safe columns. The word is revealed after the round via get_round_result() (M2).
drop view if exists public.rounds_public;
create view public.rounds_public
  with (security_invoker = false) as
  select id, room_id, round_no, drawer_id, status, started_at, ended_at, winner_id, outcome
  from public.rounds;
grant select on public.rounds_public to authenticated, anon;

-- ----------------------------------------------------------------------------
-- RPCs (Milestone 1)
-- ----------------------------------------------------------------------------
create or replace function public.gen_join_code()
returns text language plpgsql as $$
declare
  alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';  -- no I/L/O/0/1 ambiguity
  result text := '';
  i int;
begin
  for i in 1..4 loop
    result := result || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
  end loop;
  return result;
end; $$;

create or replace function public.create_room()
returns public.rooms
language plpgsql security definer set search_path = public as $$
declare
  v_uid  uuid := auth.uid();
  v_code text;
  v_room public.rooms;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  loop
    v_code := public.gen_join_code();
    exit when not exists (select 1 from public.rooms where join_code = v_code);
  end loop;
  insert into public.rooms (join_code, host_uid, current_game, status, settings)
  values (v_code, v_uid, 'quick_doodle', 'lobby', '{"rounds":3,"difficulty":"easy"}'::jsonb)
  returning * into v_room;
  return v_room;
end; $$;

create or replace function public.join_room(p_code text, p_name text, p_color text)
returns public.players
language plpgsql security definer set search_path = public as $$
declare
  v_uid    uuid := auth.uid();
  v_room   public.rooms;
  v_player public.players;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  if coalesce(trim(p_name), '') = '' then raise exception 'Name required'; end if;

  select * into v_room from public.rooms where join_code = upper(p_code);
  if not found then raise exception 'Room not found'; end if;
  if v_room.status <> 'lobby' then raise exception 'Game already started'; end if;

  -- Idempotent re-scan: if this device already joined, return its player.
  select * into v_player from public.players
   where room_id = v_room.id and auth_uid = v_uid;
  if found then return v_player; end if;

  if (select count(*) from public.players where room_id = v_room.id) >= 12 then
    raise exception 'Room is full';
  end if;

  insert into public.players (room_id, auth_uid, name, color)
  values (v_room.id, v_uid, left(trim(p_name), 16), p_color)
  returning * into v_player;
  return v_player;
exception
  when unique_violation then
    raise exception 'That colour is taken';
end; $$;

grant execute on function public.create_room()                       to authenticated;
grant execute on function public.join_room(text, text, text)         to authenticated;

-- ----------------------------------------------------------------------------
-- Realtime (Postgres Changes) for the live lobby + guess feed
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_publication_tables
                 where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'players') then
    alter publication supabase_realtime add table public.players;
  end if;
  if not exists (select 1 from pg_publication_tables
                 where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'guesses') then
    alter publication supabase_realtime add table public.guesses;
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- Word bank seed (~40 each). Extend freely.
-- ----------------------------------------------------------------------------
insert into public.words (text, difficulty) values
  ('cat','easy'),('dog','easy'),('sun','easy'),('star','easy'),('tree','easy'),
  ('house','easy'),('fish','easy'),('car','easy'),('boat','easy'),('apple','easy'),
  ('ball','easy'),('hat','easy'),('book','easy'),('moon','easy'),('cloud','easy'),
  ('flower','easy'),('cake','easy'),('clock','easy'),('key','easy'),('shoe','easy'),
  ('bird','easy'),('cup','easy'),('door','easy'),('eye','easy'),('hand','easy'),
  ('heart','easy'),('leaf','easy'),('milk','easy'),('nose','easy'),('rain','easy'),
  ('ring','easy'),('snake','easy'),('spoon','easy'),('train','easy'),('bread','easy'),
  ('chair','easy'),('frog','easy'),('kite','easy'),('lamp','easy'),('duck','easy'),
  ('guitar','medium'),('island','medium'),('rocket','medium'),('castle','medium'),('penguin','medium'),
  ('volcano','medium'),('octopus','medium'),('umbrella','medium'),('dragon','medium'),('bicycle','medium'),
  ('dolphin','medium'),('robot','medium'),('rainbow','medium'),('pirate','medium'),('ladder','medium'),
  ('cactus','medium'),('camera','medium'),('compass','medium'),('hammer','medium'),('jungle','medium'),
  ('lighthouse','medium'),('mountain','medium'),('parachute','medium'),('telescope','medium'),('tornado','medium'),
  ('treasure','medium'),('windmill','medium'),('anchor','medium'),('balloon','medium'),('butterfly','medium'),
  ('campfire','medium'),('diamond','medium'),('elephant','medium'),('fountain','medium'),('giraffe','medium'),
  ('helicopter','medium'),('kangaroo','medium'),('mermaid','medium'),('scarecrow','medium'),('snowman','medium'),
  ('chandelier','hard'),('escalator','hard'),('hourglass','hard'),('marshmallow','hard'),('photosynthesis','hard'),
  ('constellation','hard'),('gravity','hard'),('hibernation','hard'),('kaleidoscope','hard'),('metamorphosis','hard'),
  ('archipelago','hard'),('avalanche','hard'),('cathedral','hard'),('centaur','hard'),('chameleon','hard'),
  ('democracy','hard'),('earthquake','hard'),('fingerprint','hard'),('gargoyle','hard'),('hieroglyph','hard'),
  ('labyrinth','hard'),('marionette','hard'),('nightingale','hard'),('orchestra','hard'),('pendulum','hard'),
  ('quicksand','hard'),('saxophone','hard'),('silhouette','hard'),('stalactite','hard'),('submarine','hard'),
  ('telescope','hard'),('thermometer','hard'),('typewriter','hard'),('vortex','hard'),('waterfall','hard'),
  ('wheelbarrow','hard'),('xylophone','hard'),('zeppelin','hard'),('blizzard','hard'),('catapult','hard')
on conflict do nothing;

-- ============================================================================
-- Done. Next: copy Project URL + publishable/anon key into the app env vars.
-- ============================================================================
