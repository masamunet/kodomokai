-- Annual Settings Table
CREATE TABLE IF NOT EXISTS public.annual_settings (
    fiscal_year integer PRIMARY KEY,
    invitation_code text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone
);

ALTER TABLE public.annual_settings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read settings (for anonymous/public to verify code)
CREATE POLICY "Annual settings are viewable by everyone." ON public.annual_settings FOR SELECT USING (true);

-- Allow authenticated users (which are admins in our app context) to update/insert
CREATE POLICY "Annual settings updatable by authenticated users." ON public.annual_settings FOR ALL USING (auth.role() = 'authenticated');
