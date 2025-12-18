-- Add can_edit_members column to officer_roles
ALTER TABLE public.officer_roles 
ADD COLUMN can_edit_members boolean DEFAULT false NOT NULL;

-- Comment on column
COMMENT ON COLUMN public.officer_roles.can_edit_members IS 'If true, officers with this role can edit member information.';
