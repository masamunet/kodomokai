-- Migration: Add event public_status and update RLS

-- 1. Add public_status column
ALTER TABLE public.events 
ADD COLUMN public_status text CHECK (public_status IN ('draft', 'date_undecided', 'details_undecided', 'finalized')) DEFAULT 'finalized';

COMMENT ON COLUMN public.events.public_status IS 'Visibility status: draft (officer only), date_undecided, details_undecided, finalized';

-- 2. Migrate existing data
-- If is_tentative is true, set to 'date_undecided', otherwise 'finalized' (default)
UPDATE public.events
SET public_status = 'date_undecided'
WHERE is_tentative = true;

-- 3. Create helper function for checking officer status (if not exists)
-- We check if user is admin OR has an officer role assignment
CREATE OR REPLACE FUNCTION public.is_officer()
RETURNS boolean AS $$
BEGIN
  -- Check if user is authenticated
  IF auth.role() != 'authenticated' THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ) OR EXISTS (
    SELECT 1 FROM public.officer_role_assignments
    WHERE profile_id = auth.uid() 
      -- We could add logic here for current fiscal year, but generally any officer role implies officer access
      -- For stricter control: AND fiscal_year = (SELECT result FROM public.get_target_fiscal_year()) 
      -- But for now let's keep it simple as "has any role assignment" or maybe we rely on previous logic 20251218183000
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Update RLS policies
-- Drop the existing "viewable by everyone" policy
DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.events;

-- Create new policy
CREATE POLICY "Events are viewable based on status"
ON public.events FOR SELECT
USING (
  -- If not draft, visible to everyone
  public_status != 'draft' 
  OR 
  -- If draft, visible only to officers
  (auth.role() = 'authenticated' AND public.is_officer())
);

-- Note: Insert/Update/Delete policies were "authenticated".
-- If we want to be strict, we might restrict them to officers too, but for now we follow the requirement "before announcement is not visible to non-officers".
-- The existing policies allow any authenticated user to edit. We might want to tighten this later, but out of scope for just "display state".
