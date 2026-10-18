-- AI Debate Buddy schema. Every table is owner-only through row-level security.
-- Students sign up with Supabase Auth email + password; every row belongs to auth.uid().

create table public.debates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  topic text not null check (char_length(topic) between 8 and 200),
  student_side text not null check (student_side in ('for', 'against')),
  opponent text not null default 'fiona' check (opponent in ('fiona', 'tom', 'sam')),
  difficulty text not null default 'easy' check (difficulty in ('easy', 'medium', 'hard')),
  turn_seconds int not null default 60 check (turn_seconds in (60, 120)),
  locale text not null default 'en' check (locale in ('en', 'hi')),
  status text not null default 'active' check (status in ('active', 'ended')),
  review jsonb,
  created_at timestamptz not null default now(),
  ended_at timestamptz
);

create table public.debate_messages (
  id uuid primary key default gen_random_uuid(),
  debate_id uuid not null references public.debates (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  channel text not null check (channel in ('debate', 'coach')),
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) between 1 and 4000),
  created_at timestamptz not null default clock_timestamp()
);

-- One row per AI call; used for per-user rate limiting.
create table public.ai_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind text not null check (char_length(kind) <= 40),
  created_at timestamptz not null default now()
);

create index debates_user_created_idx on public.debates (user_id, created_at desc);
create index debate_messages_debate_idx on public.debate_messages (debate_id, created_at);
create index ai_requests_user_created_idx on public.ai_requests (user_id, created_at desc);

alter table public.debates enable row level security;
alter table public.debate_messages enable row level security;
alter table public.ai_requests enable row level security;

revoke all on public.debates, public.debate_messages, public.ai_requests from anon;

-- Clients may only change the review fields of a debate, never its owner, topic or side.
revoke update on public.debates from authenticated;
grant update (status, review, ended_at) on public.debates to authenticated;
revoke update, delete on public.debate_messages from authenticated;
revoke update, delete on public.ai_requests from authenticated;

create policy "debates: owner select" on public.debates
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "debates: owner insert" on public.debates
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "debates: owner update" on public.debates
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "debates: owner delete" on public.debates
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "messages: owner select" on public.debate_messages
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "messages: owner insert" on public.debate_messages
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.debates d
      where d.id = debate_id and d.user_id = (select auth.uid())
    )
  );

create policy "ai_requests: owner select" on public.ai_requests
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "ai_requests: owner insert" on public.ai_requests
  for insert to authenticated with check ((select auth.uid()) = user_id);
