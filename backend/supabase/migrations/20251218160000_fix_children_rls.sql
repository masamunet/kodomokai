-- Allow authenticated users (e.g. admins/officers) to view all children
-- Previously it was restricted to own children only.

DROP POLICY IF EXISTS "Users can view own children." ON public.children;

CREATE POLICY "Children are viewable by authenticated users" 
ON public.children FOR SELECT 
USING (auth.role() = 'authenticated');

-- Also ensure profiles are definitely viewable (though previous policy said "true")
-- Just to be safe and explicit for authenticated users
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;

CREATE POLICY "Profiles are viewable by authenticated users" 
ON public.profiles FOR SELECT 
USING (auth.role() = 'authenticated');
