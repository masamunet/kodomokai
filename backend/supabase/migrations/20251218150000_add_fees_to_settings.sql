
-- Add admission_fee and annual_fee to organization_settings

ALTER TABLE public.organization_settings
ADD COLUMN admission_fee integer NOT NULL DEFAULT 0,
ADD COLUMN annual_fee integer NOT NULL DEFAULT 0;
