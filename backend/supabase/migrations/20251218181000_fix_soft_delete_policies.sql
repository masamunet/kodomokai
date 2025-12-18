-- Migration: Fix Soft Delete Policies and ensure columns exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;
ALTER TABLE public.children ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;

-- Fix Profiles Policies
-- Drop both old and newly added names to avoid conflicts
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;

CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (deleted_at IS NULL OR is_admin = true)
  );

CREATE POLICY "Users can update own profile." ON public.profiles
  FOR UPDATE USING (
    (auth.uid() = id AND deleted_at IS NULL) OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Fix Children Policies
DROP POLICY IF EXISTS "Users can view own children." ON public.children;
DROP POLICY IF EXISTS "Children are viewable by authenticated users" ON public.children;
DROP POLICY IF EXISTS "Users can update own children." ON public.children;
DROP POLICY IF EXISTS "Users can delete own children." ON public.children;

CREATE POLICY "Children are viewable by authenticated users" ON public.children
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      deleted_at IS NULL OR 
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    )
  );

CREATE POLICY "Users can update own children." ON public.children
  FOR UPDATE USING (
    (auth.uid() = parent_id AND deleted_at IS NULL) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Users can delete own children." ON public.children
  FOR DELETE USING (
    (auth.uid() = parent_id AND deleted_at IS NULL) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Fix Officer Assignments Policies
DROP POLICY IF EXISTS "Assignments are viewable by everyone" ON public.officer_role_assignments;
CREATE POLICY "Assignments are viewable by everyone" ON public.officer_role_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = officer_role_assignments.profile_id
      AND (profiles.deleted_at IS NULL OR profiles.is_admin = true)
    )
  );
