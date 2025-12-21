create table if not exists public.general_assembly_materials (
  id uuid not null default gen_random_uuid(),
  fiscal_year integer not null,
  material_type text not null, -- 'cover', 'activity_report', 'settlement_report', etc.
  is_distributed boolean not null default false,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  constraint general_assembly_materials_pkey primary key (id),
  constraint general_assembly_materials_unique_year_type unique (fiscal_year, material_type)
);

-- RLS Policies
alter table public.general_assembly_materials enable row level security;

-- Everyone (authenticated) can view
create policy "Materials are viewable by authenticated users"
  on public.general_assembly_materials
  for select
  using (auth.role() = 'authenticated');

-- Only admins/officers can insert/update (simplifying to authenticated for now based on existing patterns, or officer check if needed)
-- Based on previous migrations, it seems we might be relying on application logic or broad RLS for officers.
-- Let's check 'officer_role_assignments' or similar. 
-- For now, allowing all authenticated users to insert/update IF they are officers is complex in RLS without helper functions.
-- Given '20251218190000_simplify_rls.sql' says "RLS is just for login check", we will follow that pattern for now
-- BUT we should probably restrict write access if possible. 
-- However, following the user's existing "Simplify RLS" pattern:

create policy "Materials are editable by authenticated users"
  on public.general_assembly_materials
  for all
  using (auth.role() = 'authenticated');
