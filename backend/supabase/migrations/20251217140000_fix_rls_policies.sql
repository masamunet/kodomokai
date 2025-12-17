
-- Enable RLS for all tables if not already (safeguard)
ALTER TABLE public.officer_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.officer_role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.officer_tasks ENABLE ROW LEVEL SECURITY;

-- Officer Roles
CREATE POLICY "Roles are viewable by everyone" ON public.officer_roles FOR SELECT USING (true);
CREATE POLICY "Roles are modifiable by authenticated users" ON public.officer_roles FOR ALL USING (auth.role() = 'authenticated');

-- Officer Role Assignments
CREATE POLICY "Assignments are viewable by everyone" ON public.officer_role_assignments FOR SELECT USING (true);
CREATE POLICY "Assignments are modifiable by authenticated users" ON public.officer_role_assignments FOR ALL USING (auth.role() = 'authenticated');

-- Officer Tasks
CREATE POLICY "Tasks are viewable by everyone" ON public.officer_tasks FOR SELECT USING (true);
CREATE POLICY "Tasks are modifiable by authenticated users" ON public.officer_tasks FOR ALL USING (auth.role() = 'authenticated');

-- Organization Settings (Ensure UPDATE is allowed - previously added, but let's ensure INSERT too just in case)
CREATE POLICY "Settings insertable by authenticated users" ON public.organization_settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
