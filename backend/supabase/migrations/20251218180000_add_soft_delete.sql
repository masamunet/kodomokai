-- Migration: Add Soft Delete
-- Add deleted_at columns
ALTER TABLE public.profiles ADD COLUMN deleted_at timestamp with time zone;
ALTER TABLE public.children ADD COLUMN deleted_at timestamp with time zone;

-- Update Profiles RLS
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id AND deleted_at IS NULL);

-- Update Children RLS
DROP POLICY IF EXISTS "Users can view own children." ON public.children;
CREATE POLICY "Users can view own children." ON public.children
  FOR SELECT USING (
    (auth.uid() = parent_id OR EXISTS (
      -- allow officers who can edit members to see children
      SELECT 1 FROM public.officer_role_assignments ora
      JOIN public.officer_roles oroles ON ora.role_id = oroles.id
      WHERE ora.profile_id = auth.uid() AND oroles.can_edit_members = true
    ))
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "Users can update own children." ON public.children;
CREATE POLICY "Users can update own children." ON public.children
  FOR UPDATE USING (auth.uid() = parent_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can delete own children." ON public.children;
CREATE POLICY "Users can delete own children." ON public.children
  FOR DELETE USING (auth.uid() = parent_id AND deleted_at IS NULL);

-- Update Officer Assignments RLS (Hide assignments of deleted profiles)
DROP POLICY IF EXISTS "Assignments are viewable by everyone" ON public.officer_role_assignments;
CREATE POLICY "Assignments are viewable by everyone" ON public.officer_role_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = officer_role_assignments.profile_id
      AND profiles.deleted_at IS NULL
    )
  );
