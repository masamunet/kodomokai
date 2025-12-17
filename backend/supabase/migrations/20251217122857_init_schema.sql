-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (Parents/Members)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text, -- Copied from auth.users for easier queries
  full_name text,
  phone text,
  address text,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_active boolean default true,
  is_admin boolean default false, -- Simple admin flag for now, role-based is handled in officer tables
  updated_at timestamp with time zone
);

alter table public.profiles enable row level security;

-- CHILDREN
create table public.children (
  id uuid default gen_random_uuid() primary key,
  parent_id uuid references public.profiles(id) on delete cascade not null,
  full_name text not null,
  gender text check (gender in ('male', 'female', 'other')),
  birthday date,
  allergies text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone
);

alter table public.children enable row level security;

-- OFFICER ROLES (Master table for role types: President, Treasurer, etc.)
create table public.officer_roles (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.officer_roles enable row level security;

-- OFFICER ROLE ASSIGNMENTS (History of who was what role when)
create table public.officer_role_assignments (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  role_id uuid references public.officer_roles(id) on delete cascade not null,
  fiscal_year integer not null, -- e.g. 2024
  start_date date,
  end_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.officer_role_assignments enable row level security;

-- OFFICER TASKS (Tasks associated with specific roles)
create table public.officer_tasks (
  id uuid default gen_random_uuid() primary key,
  role_id uuid references public.officer_roles(id) on delete cascade not null,
  title text not null,
  description text,
  is_monthly boolean default false, -- If true, repeats every month
  due_date date, -- For specific deadlines
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.officer_tasks enable row level security;

-- EVENTS
create table public.events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone,
  location text,
  type text check (type in ('meeting', 'recreation', 'other')),
  rsvp_required boolean default false,
  rsvp_deadline timestamp with time zone,
  form_schema jsonb, -- For custom questions (JSON structure)
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.events enable row level security;

-- EVENT PARTICIPANTS
create table public.event_participants (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  child_id uuid references public.children(id) on delete cascade, -- Optional, if specific child is attending
  status text check (status in ('attending', 'declined', 'maybe')) not null,
  answers jsonb, -- Answers to custom form questions
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone
);

alter table public.event_participants enable row level security;

-- POSTS (Q&A Board)
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references public.profiles(id) on delete set null,
  title text,
  content text not null,
  parent_id uuid references public.posts(id) on delete cascade, -- For replies
  is_question boolean default false,
  is_resolved boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone
);

alter table public.posts enable row level security;

-- DOCUMENTS (Minutes, etc.)
create table public.documents (
  id uuid default gen_random_uuid() primary key,
  uploader_id uuid references public.profiles(id) on delete set null,
  title text not null,
  file_url text not null,
  file_type text,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.documents enable row level security;

-- RLS POLICIES (Basic Examples)
-- Profiles: Users can view all profiles (directory), but only edit their own.
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Children: Users can view their own children. (Maybe officers can view all?)
create policy "Users can view own children." on public.children for select using (auth.uid() = parent_id);
create policy "Users can update own children." on public.children for update using (auth.uid() = parent_id);
create policy "Users can delete own children." on public.children for delete using (auth.uid() = parent_id);
create policy "Users can insert own children." on public.children for insert with check (auth.uid() = parent_id);

-- TODO: Add policies for officers to view all children/profiles. Needs a custom function or claim.

-- Trigger for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profiles_updated before update on public.profiles
  for each row execute procedure public.handle_updated_at();
  
create trigger on_children_updated before update on public.children
  for each row execute procedure public.handle_updated_at();

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

