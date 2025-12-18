-- Add scheduled_end_date column to events table
ALTER TABLE public.events 
ADD COLUMN scheduled_end_date date;

COMMENT ON COLUMN public.events.scheduled_end_date IS 'End date for multi-day events. Null if single-day.';
