-- Migration: Robust Admin/Officer RLS Bypass
-- Profiles
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      deleted_at IS NULL OR 
      is_admin = true OR -- Rule: Admins can see themselves and others (this is tricky, so simpler to check the requester)
      (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)) OR
      (EXISTS (
        SELECT 1 FROM public.officer_role_assignments ora
        JOIN public.officer_roles oroles ON ora.role_id = oroles.id
        WHERE ora.profile_id = auth.uid() AND oroles.can_edit_members = true
      ))
    )
  );

-- Children
DROP POLICY IF EXISTS "Children are viewable by authenticated users" ON public.children;
CREATE POLICY "Children are viewable by authenticated users" ON public.children
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      deleted_at IS NULL OR 
      (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)) OR
      (EXISTS (
        SELECT 1 FROM public.officer_role_assignments ora
        JOIN public.officer_roles oroles ON ora.role_id = oroles.id
        WHERE ora.profile_id = auth.uid() AND oroles.can_edit_members = true
      ))
    )
  );
