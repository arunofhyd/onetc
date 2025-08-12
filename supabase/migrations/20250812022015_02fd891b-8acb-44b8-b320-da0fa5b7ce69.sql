-- Create room_memberships table
create table if not exists public.room_memberships (
  id uuid primary key default gen_random_uuid(),
  room_id text not null references public.rooms(id) on delete cascade,
  user_id uuid not null,
  joined_at timestamptz not null default now(),
  unique (room_id, user_id)
);

-- Enable RLS
alter table public.room_memberships enable row level security;

-- Drop overly permissive policies on rooms and messages
drop policy if exists "Anyone can create rooms" on public.rooms;
drop policy if exists "Anyone can delete rooms" on public.rooms;
drop policy if exists "Anyone can view rooms" on public.rooms;

drop policy if exists "Anyone can create messages" on public.messages;
drop policy if exists "Anyone can delete messages" on public.messages;
drop policy if exists "Anyone can view messages" on public.messages;

-- Drop our secure policies if they exist (for idempotency)
drop policy if exists "Members can view room" on public.rooms;
drop policy if exists "Authenticated can create rooms" on public.rooms;

drop policy if exists "Members can read messages" on public.messages;
drop policy if exists "Members can send messages" on public.messages;

drop policy if exists "Users can view their memberships" on public.room_memberships;
drop policy if exists "Users can join rooms" on public.room_memberships;
drop policy if exists "Users can leave rooms" on public.room_memberships;

-- Secure rooms: only members can view, only authenticated can create, no delete by default
create policy "Members can view room"
  on public.rooms for select
  to authenticated
  using (
    exists (
      select 1 from public.room_memberships m
      where m.room_id = public.rooms.id and m.user_id = auth.uid()
    )
  );

create policy "Authenticated can create rooms"
  on public.rooms for insert
  to authenticated
  with check (true);

-- Secure messages: only members can read/insert, no delete by default
create policy "Members can read messages"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1 from public.room_memberships m
      where m.room_id = public.messages.room_id and m.user_id = auth.uid()
    )
  );

create policy "Members can send messages"
  on public.messages for insert
  to authenticated
  with check (
    exists (
      select 1 from public.room_memberships m
      where m.room_id = public.messages.room_id and m.user_id = auth.uid()
    )
  );

-- Policies for memberships
create policy "Users can view their memberships"
  on public.room_memberships for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can join rooms"
  on public.room_memberships for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can leave rooms"
  on public.room_memberships for delete
  to authenticated
  using (user_id = auth.uid());