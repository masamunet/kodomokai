-- Add target_month to officer_tasks for annual schedule items
alter table public.officer_tasks
add column target_month integer check (target_month >= 1 and target_month <= 12);

comment on column public.officer_tasks.target_month is 'Specific month (1-12) for the task. If null and is_monthly is false, it is a general task.';
