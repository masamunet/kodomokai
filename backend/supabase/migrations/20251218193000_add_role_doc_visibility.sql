-- Add is_visible_in_docs column to officer_roles
ALTER TABLE public.officer_roles ADD COLUMN is_visible_in_docs boolean DEFAULT true;
