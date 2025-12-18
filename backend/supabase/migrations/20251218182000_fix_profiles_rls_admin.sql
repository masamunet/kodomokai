-- Migration: Correct Profiles SELECT RLS to check requester's is_admin status
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;

CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      deleted_at IS NULL OR 
      EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
    )
  );
