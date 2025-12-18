-- Add RLS policies for events table

-- Enable RLS (Should already be enabled, but good to ensure)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone (public events)
CREATE POLICY "Events are viewable by everyone" 
ON public.events FOR SELECT 
USING (true);

-- Allow authenticated users to insert events
-- (Ideally, we might want to restrict this to 'officer' role, but for now 'authenticated' is the requirement/standard in this app context based on `regular_meetings`)
CREATE POLICY "Events are insertable by authenticated users" 
ON public.events FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update events
CREATE POLICY "Events are updatable by authenticated users" 
ON public.events FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete events
CREATE POLICY "Events are deletable by authenticated users" 
ON public.events FOR DELETE 
USING (auth.role() = 'authenticated');
