-- Add name columns to profiles
ALTER TABLE public.profiles
ADD COLUMN last_name text,
ADD COLUMN first_name text,
ADD COLUMN last_name_kana text,
ADD COLUMN first_name_kana text;

-- Add name columns to children
ALTER TABLE public.children
ADD COLUMN last_name text,
ADD COLUMN first_name text,
ADD COLUMN last_name_kana text,
ADD COLUMN first_name_kana text;

-- Backfill profiles (Split full_name by first space)
UPDATE public.profiles
SET
  last_name = CASE
    WHEN position(' ' in full_name) > 0 THEN split_part(full_name, ' ', 1)
    WHEN position('　' in full_name) > 0 THEN split_part(full_name, '　', 1) -- Handle full-width space
    ELSE full_name
  END,
  first_name = CASE
    WHEN position(' ' in full_name) > 0 THEN substring(full_name from position(' ' in full_name) + 1)
    WHEN position('　' in full_name) > 0 THEN substring(full_name from position('　' in full_name) + 1)
    ELSE ''
  END;

-- Backfill children
UPDATE public.children
SET
  last_name = CASE
    WHEN position(' ' in full_name) > 0 THEN split_part(full_name, ' ', 1)
    WHEN position('　' in full_name) > 0 THEN split_part(full_name, '　', 1)
    ELSE full_name
  END,
  first_name = CASE
    WHEN position(' ' in full_name) > 0 THEN substring(full_name from position(' ' in full_name) + 1)
    WHEN position('　' in full_name) > 0 THEN substring(full_name from position('　' in full_name) + 1)
    ELSE ''
  END;

-- Update handle_new_user trigger to populate new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    last_name,
    first_name,
    last_name_kana,
    first_name_kana
  )
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'last_name' || ' ' || (new.raw_user_meta_data->>'first_name'),
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name_kana',
    new.raw_user_meta_data->>'first_name_kana'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
