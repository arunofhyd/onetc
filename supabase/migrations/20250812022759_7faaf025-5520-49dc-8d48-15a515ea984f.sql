-- Fix dependency drop order with CASCADE, then apply anonymous RPC model

-- Drop policies referencing room_memberships first
DROP POLICY IF EXISTS "Members can view room" ON public.rooms;
DROP POLICY IF EXISTS "Authenticated can create rooms" ON public.rooms;
DROP POLICY IF EXISTS "Anyone can create rooms" ON public.rooms;
DROP POLICY IF EXISTS "Anyone can delete rooms" ON public.rooms;
DROP POLICY IF EXISTS "Anyone can view rooms" ON public.rooms;

DROP POLICY IF EXISTS "Members can read messages" ON public.messages;
DROP POLICY IF EXISTS "Members can send messages" ON public.messages;
DROP POLICY IF EXISTS "Anyone can create messages" ON public.messages;
DROP POLICY IF EXISTS "Anyone can delete messages" ON public.messages;
DROP POLICY IF EXISTS "Anyone can view messages" ON public.messages;

DROP POLICY IF EXISTS "Users can view their memberships" ON public.room_memberships;
DROP POLICY IF EXISTS "Users can join rooms" ON public.room_memberships;
DROP POLICY IF EXISTS "Users can leave rooms" ON public.room_memberships;

-- Now drop the table
DROP TABLE IF EXISTS public.room_memberships CASCADE;

-- Ensure RLS is enabled
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create rate limit table
CREATE TABLE IF NOT EXISTS public.room_create_limits (
  client_id text PRIMARY KEY,
  window_start timestamptz NOT NULL DEFAULT now(),
  count int NOT NULL DEFAULT 0
);

-- Helper function
CREATE OR REPLACE FUNCTION public.check_and_increment_room_limit(_client_id text, _limit int DEFAULT 30, _window interval DEFAULT interval '1 hour')
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  rec record;
BEGIN
  SELECT client_id, window_start, count INTO rec
  FROM public.room_create_limits
  WHERE client_id = _client_id
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.room_create_limits(client_id, window_start, count)
    VALUES (_client_id, now(), 1);
    RETURN true;
  END IF;

  IF now() - rec.window_start > _window THEN
    UPDATE public.room_create_limits
    SET window_start = now(), count = 1
    WHERE client_id = _client_id;
    RETURN true;
  ELSE
    IF rec.count < _limit THEN
      UPDATE public.room_create_limits
      SET count = rec.count + 1
      WHERE client_id = _client_id;
      RETURN true;
    ELSE
      RETURN false;
    END IF;
  END IF;
END;
$$;

-- Create room RPC
CREATE OR REPLACE FUNCTION public.create_room_anonymous(_room_id text, _creator_client_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.check_and_increment_room_limit(_creator_client_id) THEN
    RAISE EXCEPTION 'rate_limit_exceeded';
  END IF;

  INSERT INTO public.rooms(id, creator_id) VALUES (_room_id, _creator_client_id)
  ON CONFLICT (id) DO NOTHING;
END;
$$;

-- Send message RPC
CREATE OR REPLACE FUNCTION public.send_message_anonymous(_room_id text, _client_id text, _content text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  INSERT INTO public.messages(room_id, sender_id, content)
  VALUES (_room_id, _client_id, _content);
$$;

-- List messages RPC
CREATE OR REPLACE FUNCTION public.list_messages(_room_id text, _limit int DEFAULT 200)
RETURNS SETOF public.messages
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT * FROM public.messages
  WHERE room_id = _room_id
  ORDER BY created_at ASC
  LIMIT _limit;
$$;

-- Room exists RPC
CREATE OR REPLACE FUNCTION public.room_exists_anonymous(_room_id text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.rooms WHERE id = _room_id);
$$;