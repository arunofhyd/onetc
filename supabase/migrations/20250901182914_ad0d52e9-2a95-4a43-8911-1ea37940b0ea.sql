-- Fix RLS policies to prevent direct table access while allowing RPC functions

-- Messages table - block direct access, allow only through RPC functions
DROP POLICY IF EXISTS "Allow message access through RPC functions" ON public.messages;

-- Block all direct access to messages table
-- SECURITY DEFINER functions will still work as they bypass RLS
CREATE POLICY "Block direct message access" 
ON public.messages 
FOR ALL 
USING (false)
WITH CHECK (false);

-- Rooms table - block direct access, allow only through RPC functions  
DROP POLICY IF EXISTS "Allow room access through RPC functions" ON public.rooms;

CREATE POLICY "Block direct room access" 
ON public.rooms 
FOR ALL 
USING (false)
WITH CHECK (false);

-- Room create limits - block direct access, allow only through RPC functions
DROP POLICY IF EXISTS "Allow rate limit access through RPC functions" ON public.room_create_limits;

CREATE POLICY "Block direct rate limit access" 
ON public.room_create_limits 
FOR ALL 
USING (false)
WITH CHECK (false);

-- Verify RPC functions can still execute by granting necessary permissions
-- The SECURITY DEFINER functions should bypass RLS policies
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;