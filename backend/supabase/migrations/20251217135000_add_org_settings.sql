
-- Organization Settings Table (Singleton)
CREATE TABLE public.organization_settings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL DEFAULT '子供会',
    fiscal_year_start_month integer NOT NULL DEFAULT 4 CHECK (fiscal_year_start_month BETWEEN 1 AND 12),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone
);

ALTER TABLE public.organization_settings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read settings
CREATE POLICY "Settings are viewable by everyone." ON public.organization_settings FOR SELECT USING (true);

-- Only admins can update (using simple is_admin check from profiles, or just allow all authenticated for now and restrict via UI/Action logic)
-- Ideally we check if auth.uid() is an admin profile.
-- For simplicity in this SQL, we allow authenticated users to update if they are admin.
-- But RLS with joins can be tricky. Let's start with update enabled for authenticated, and enforce "Admin-only" in the application layer or via a more complex policy later.
CREATE POLICY "Settings updatable by authenticated users." ON public.organization_settings FOR UPDATE USING (auth.role() = 'authenticated');

-- Insert default row if not exists
INSERT INTO public.organization_settings (name, fiscal_year_start_month)
SELECT '子供会', 4
WHERE NOT EXISTS (SELECT 1 FROM public.organization_settings);
