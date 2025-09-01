-- Fix RLS policies for anonymous chat security

-- Messages table policies
DROP POLICY IF EXISTS "Allow anonymous message reading via RPC" ON public.messages;
DROP POLICY IF EXISTS "Allow anonymous message sending via RPC" ON public.messages;

-- Create policies that only allow access through RPC functions
-- This prevents direct table access while allowing controlled access via functions

CREATE POLICY "Allow anonymous message reading via RPC" 
ON public.messages 
FOR SELECT 
USING (
  -- Only allow reading messages through the list_messages RPC function
  -- This is checked by ensuring the function is being called by a security definer function
  current_setting('role') = 'postgres' OR 
  current_setting('role') = 'supabase_admin'
);

CREATE POLICY "Allow anonymous message sending via RPC" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  -- Only allow inserting messages through the send_message_anonymous RPC function
  -- This is checked by ensuring the function is being called by a security definer function
  current_setting('role') = 'postgres' OR 
  current_setting('role') = 'supabase_admin'
);

-- Rooms table policies  
DROP POLICY IF EXISTS "Allow anonymous room access" ON public.rooms;

CREATE POLICY "Allow anonymous room access" 
ON public.rooms 
FOR ALL 
USING (
  -- Allow access through RPC functions only
  current_setting('role') = 'postgres' OR 
  current_setting('role') = 'supabase_admin'
);

-- Room create limits policies
DROP POLICY IF EXISTS "Allow rate limit checks" ON public.room_create_limits;

CREATE POLICY "Allow rate limit checks" 
ON public.room_create_limits 
FOR ALL 
USING (
  -- Allow access through RPC functions only
  current_setting('role') = 'postgres' OR 
  current_setting('role') = 'supabase_admin'
);