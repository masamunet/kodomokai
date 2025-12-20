-- Allow users to insert their own event participation records
create policy "Users can insert own event participation." 
on public.event_participants 
for insert 
with check (auth.uid() = profile_id);

-- Also ensure they can select, update, and delete their own records
create policy "Users can view own event participation." 
on public.event_participants 
for select 
using (auth.uid() = profile_id);

create policy "Users can update own event participation." 
on public.event_participants 
for update 
using (auth.uid() = profile_id);

create policy "Users can delete own event participation." 
on public.event_participants 
for delete 
using (auth.uid() = profile_id);
