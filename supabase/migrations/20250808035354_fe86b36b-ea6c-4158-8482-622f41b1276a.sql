-- Change room ID from UUID to TEXT to support short alphanumeric keys
ALTER TABLE public.rooms ALTER COLUMN id TYPE TEXT;

-- Update the foreign key constraint in messages table
ALTER TABLE public.messages DROP CONSTRAINT messages_room_id_fkey;
ALTER TABLE public.messages ALTER COLUMN room_id TYPE TEXT;
ALTER TABLE public.messages ADD CONSTRAINT messages_room_id_fkey 
  FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE;