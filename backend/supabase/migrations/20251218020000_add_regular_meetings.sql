-- Create Regular Meetings table
create table public.regular_meetings (
  id uuid default gen_random_uuid() primary key,
  target_year integer not null, -- Fiscal Year
  target_month integer not null, -- 1-12
  scheduled_date date,
  start_time time, -- HH:MM:SS
  location text,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone
);

alter table public.regular_meetings enable row level security;

-- Create Meeting Agendas table
create table public.meeting_agendas (
  id uuid default gen_random_uuid() primary key,
  meeting_id uuid references public.regular_meetings(id) on delete cascade not null,
  title text not null,
  description text,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone
);

alter table public.meeting_agendas enable row level security;

-- Add RLS Policies
-- Regular Meetings
create policy "Regular meetings are viewable by everyone" on public.regular_meetings for select using (true);
create policy "Regular meetings are modifiable by authenticated users" on public.regular_meetings for all using (auth.role() = 'authenticated');

-- Meeting Agendas
create policy "Meeting agendas are viewable by everyone" on public.meeting_agendas for select using (true);
create policy "Meeting agendas are modifiable by authenticated users" on public.meeting_agendas for all using (auth.role() = 'authenticated');

-- Add triggers for updated_at
create trigger on_regular_meetings_updated before update on public.regular_meetings
  for each row execute procedure public.handle_updated_at();

create trigger on_meeting_agendas_updated before update on public.meeting_agendas
  for each row execute procedure public.handle_updated_at();
