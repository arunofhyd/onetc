-- Create rooms table
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no authentication required)
CREATE POLICY "Anyone can view rooms" 
ON public.rooms 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create rooms" 
ON public.rooms 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can delete rooms" 
ON public.rooms 
FOR DELETE 
USING (true);

CREATE POLICY "Anyone can view messages" 
ON public.messages 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can delete messages" 
ON public.messages 
FOR DELETE 
USING (true);

-- Enable realtime for real-time updates
ALTER TABLE public.rooms REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;