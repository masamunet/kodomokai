-- Migration: Fix RLS recursion in profiles and children
-- 1. Create helper functions to avoid recursion in RLS
CREATE OR REPLACE FUNCTION public.check_is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.check_can_edit_members(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.officer_role_assignments ora
    JOIN public.officer_roles oroles ON ora.role_id = oroles.id
    WHERE ora.profile_id = user_id AND oroles.can_edit_members = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Repair Profiles Policies
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      deleted_at IS NULL OR 
      id = auth.uid() OR -- Always see self
      public.check_is_admin(auth.uid()) OR
      public.check_can_edit_members(auth.uid())
    )
  );

-- 3. Repair Children Policies
DROP POLICY IF EXISTS "Children are viewable by authenticated users" ON public.children;
CREATE POLICY "Children are viewable by authenticated users" ON public.children
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      deleted_at IS NULL OR 
      public.check_is_admin(auth.uid()) OR
      public.check_can_edit_members(auth.uid())
    )
  );

-- 4. Repair Officer Assignments Policies
DROP POLICY IF EXISTS "Assignments are viewable by everyone" ON public.officer_role_assignments;
CREATE POLICY "Assignments are viewable by everyone" ON public.officer_role_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = officer_role_assignments.profile_id
      AND (profiles.deleted_at IS NULL OR public.check_is_admin(auth.uid()))
    )
  );
