-- Revert soft delete and ensure valid physical delete structure

-- 1. Clean up "soft deleted" data physically from public schema
DELETE FROM public.children WHERE deleted_at IS NOT NULL;
DELETE FROM public.profiles WHERE deleted_at IS NOT NULL;

-- 2. Drop Policies that depend on deleted_at to avoid dependency errors
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;

DROP POLICY IF EXISTS "Children are viewable by authenticated users" ON public.children;
DROP POLICY IF EXISTS "Users can view own children." ON public.children;
DROP POLICY IF EXISTS "Users can update own children." ON public.children;
DROP POLICY IF EXISTS "Users can delete own children." ON public.children;

DROP POLICY IF EXISTS "Assignments are viewable by everyone" ON public.officer_role_assignments;

-- 3. Drop the deleted_at columns
ALTER TABLE public.children DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS deleted_at;

-- 4. Recreate Policies (Standard/Original Logic without soft delete)

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Children
-- Allow parents to view own, and Admins/Officers with permission to view all
CREATE POLICY "Users can view own children." ON public.children FOR SELECT USING (
  auth.uid() = parent_id OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  ) OR
  EXISTS (
    SELECT 1 FROM public.officer_role_assignments ora
    JOIN public.officer_roles oroles ON ora.role_id = oroles.id
    WHERE ora.profile_id = auth.uid() -- implied current year? or any year? Usually current.
    -- To keep it simple and consistent with previous complex queries, we allow if they have *any* edit permission role
    -- ideally this should filter by year but 'officer_role_assignments' logic usually filters by year in app
    AND oroles.can_edit_members = true
  )
);

CREATE POLICY "Users can update own children." ON public.children FOR UPDATE USING (auth.uid() = parent_id);
CREATE POLICY "Users can delete own children." ON public.children FOR DELETE USING (auth.uid() = parent_id);

-- Assignments
CREATE POLICY "Assignments are viewable by everyone" ON public.officer_role_assignments FOR SELECT USING (true);


-- 5. Ensure profiles -> auth.users FK has ON DELETE CASCADE
DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Find the Foreign Key constraint from profiles to auth.users
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
    AND confrelid = 'auth.users'::regclass
    AND contype = 'f';
    
    -- Recreate it with ON DELETE CASCADE
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.profiles DROP CONSTRAINT ' || quote_ident(constraint_name);
        EXECUTE 'ALTER TABLE public.profiles ADD CONSTRAINT ' || quote_ident(constraint_name) || 
                ' FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE';
    END IF;
END $$;
