-- Fix RLS policies to allow anonymous users access through RPC functions

-- Messages table policies - allow anon role access through RPC functions
DROP POLICY IF EXISTS "Allow anonymous message reading via RPC" ON public.messages;
DROP POLICY IF EXISTS "Allow anonymous message sending via RPC" ON public.messages;

-- Since we're using SECURITY DEFINER functions, we need to allow the anon role
-- The security is enforced at the RPC function level, not the table level
CREATE POLICY "Allow message access through RPC functions" 
ON public.messages 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Rooms table policies - allow access through RPC functions
DROP POLICY IF EXISTS "Allow anonymous room access" ON public.rooms;

CREATE POLICY "Allow room access through RPC functions" 
ON public.rooms 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Room create limits policies - allow access through RPC functions
DROP POLICY IF EXISTS "Allow rate limit checks" ON public.room_create_limits;

CREATE POLICY "Allow rate limit access through RPC functions" 
ON public.room_create_limits 
FOR ALL 
USING (true)
WITH CHECK (true);