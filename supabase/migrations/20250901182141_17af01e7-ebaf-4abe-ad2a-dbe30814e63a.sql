-- Enable RLS on all tables
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY; 
ALTER TABLE public.room_create_limits ENABLE ROW LEVEL SECURITY;

-- Grant execute permissions to anon and authenticated roles for RPC functions
GRANT EXECUTE ON FUNCTION public.check_and_increment_room_limit(text, integer, interval) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_room_anonymous(text, text) TO anon, authenticated;  
GRANT EXECUTE ON FUNCTION public.send_message_anonymous(text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.list_messages(text, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.room_exists_anonymous(text) TO anon, authenticated;