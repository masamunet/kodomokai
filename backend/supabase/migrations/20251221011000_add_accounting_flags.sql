-- Add is_audit and is_accounting columns to officer_roles
alter table officer_roles
add column is_audit boolean default false,
add column is_accounting boolean default false;

-- Add is_audited column to fiscal_reports
alter table fiscal_reports
add column is_audited boolean default false;
