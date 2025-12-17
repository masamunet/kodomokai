-- Split start_time (timestamp) into scheduled_date (date) and start_time (time)

-- 1. Add scheduled_date column
ALTER TABLE public.events ADD COLUMN scheduled_date date;

-- 2. Populate scheduled_date from start_time
UPDATE public.events SET scheduled_date = start_time::date;

-- 3. Make scheduled_date NOT NULL
ALTER TABLE public.events ALTER COLUMN scheduled_date SET NOT NULL;

-- 4. Convert start_time to TIME type and Drop NOT NULL constraint
ALTER TABLE public.events ALTER COLUMN start_time TYPE time USING start_time::time;
ALTER TABLE public.events ALTER COLUMN start_time DROP NOT NULL;
