-- Add creator_id column to rooms
ALTER TABLE public.rooms
ADD COLUMN IF NOT EXISTS creator_id UUID;

-- Index for faster lookups by creator
CREATE INDEX IF NOT EXISTS rooms_creator_id_idx
ON public.rooms (creator_id);
