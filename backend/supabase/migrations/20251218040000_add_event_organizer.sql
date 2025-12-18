-- Add organizer column to events table
ALTER TABLE public.events 
ADD COLUMN organizer text DEFAULT '単位子ども会';

COMMENT ON COLUMN public.events.organizer IS 'Organizer/Host of the event: 単位子ども会, 町子供会育成連合会, その他';
