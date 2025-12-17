
-- Add display_order column to officer_roles
ALTER TABLE public.officer_roles ADD COLUMN display_order integer DEFAULT 0;

-- Update existing roles with some default order (optional, but good practice)
-- Assuming we want created_at order for now if no specific order
-- UPDATE public.officer_roles SET display_order = 0; 
