-- Add Wareki configuration to organization_settings
ALTER TABLE public.organization_settings
ADD COLUMN wareki_era_name text NOT NULL DEFAULT '令和',
ADD COLUMN wareki_start_year integer NOT NULL DEFAULT 2019;
