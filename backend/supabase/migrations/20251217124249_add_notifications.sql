-- Notification Templates
create table public.notification_templates (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  subject text not null,
  body text not null, -- Markdown or Text
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone
);

alter table public.notification_templates enable row level security;

-- Notifications
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  template_id uuid references public.notification_templates(id) on delete set null,
  subject text not null,
  body text not null,
  sent_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references public.profiles(id) on delete set null
);

alter table public.notifications enable row level security;

-- Recipients (Tracking)
create table public.notification_recipients (
  id uuid default gen_random_uuid() primary key,
  notification_id uuid references public.notifications(id) on delete cascade not null,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  is_read boolean default false,
  read_at timestamp with time zone,
  read_token uuid default gen_random_uuid() not null, -- For email link tracking
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(notification_id, profile_id)
);

alter table public.notification_recipients enable row level security;
create index idx_notification_recipients_token on public.notification_recipients(read_token);

-- RLS
-- Templates: Admin/Officer read/write (TODO: refine roles). For now, allow authenticated users to view.
create policy "Templates are viewable by authenticated users." on public.notification_templates for select using (auth.role() = 'authenticated');
create policy "Templates are insertable by authenticated users." on public.notification_templates for insert with check (auth.role() = 'authenticated');
create policy "Templates are updatable by authenticated users." on public.notification_templates for update using (auth.role() = 'authenticated');

-- Notifications
create policy "Notifications are viewable by authenticated users." on public.notifications for select using (auth.role() = 'authenticated');
create policy "Notifications are insertable by authenticated users." on public.notifications for insert with check (auth.role() = 'authenticated');

-- Recipients
-- Users can see their own notifications
create policy "Users can see own notifications." on public.notification_recipients for select using (auth.uid() = profile_id);

-- Admins/Senders can see all? (For tracking) - Simplifying for now to allow all authenticated to read (in a real app, strict rules needed)
create policy "Auth users can read all recipient statuses" on public.notification_recipients for select using (auth.role() = 'authenticated');

-- Update read status: Users can update their own
create policy "Users can update own read status." on public.notification_recipients for update using (auth.uid() = profile_id);

-- But wait, for the "email link" (anonymous token access), we might need a function or allow public access via RPC.
-- We'll implement a secure RPC function to "mark as read by token" so we don't need to expose the table anonymously.

create or replace function public.mark_notification_read_by_token(token uuid)
returns boolean
language plpgsql
security definer -- Run as superuser to bypass RLS when called anonymously (if we allow it) OR just convenient
as $$
declare
  recipient_record public.notification_recipients%ROWTYPE;
begin
  select * into recipient_record from public.notification_recipients where read_token = token;
  
  if not found then
    return false;
  end if;
  
  update public.notification_recipients
  set is_read = true, read_at = now()
  where id = recipient_record.id;
  
  return true;
end;
$$;
