-- Add is_tentative column to events table
ALTER TABLE public.events 
ADD COLUMN is_tentative boolean DEFAULT false;

COMMENT ON COLUMN public.events.is_tentative IS 'If true, the date is Tentative (e.g. only month is decided)';
