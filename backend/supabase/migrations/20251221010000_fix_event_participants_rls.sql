-- Allow users to insert their own event participation records
drop policy if exists "Users can insert own event participation." on public.event_participants;
create policy "Users can insert own event participation." 
on public.event_participants 
for insert 
with check (auth.uid() = profile_id);

-- Also ensure they can select, update, and delete their own records
drop policy if exists "Users can view own event participation." on public.event_participants;
create policy "Users can view own event participation." 
on public.event_participants 
for select 
using (auth.uid() = profile_id);

drop policy if exists "Users can update own event participation." on public.event_participants;
create policy "Users can update own event participation." 
on public.event_participants 
for update 
using (auth.uid() = profile_id);

drop policy if exists "Users can delete own event participation." on public.event_participants;
create policy "Users can delete own event participation." 
on public.event_participants 
for delete 
using (auth.uid() = profile_id);
