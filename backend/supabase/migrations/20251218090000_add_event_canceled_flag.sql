ALTER TABLE public.events ADD COLUMN is_canceled BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.events.is_canceled IS 'Indicates if the event has been canceled';
