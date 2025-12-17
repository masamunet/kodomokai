
-- Insert Officer Roles
INSERT INTO public.officer_roles (id, name, description)
VALUES 
    (gen_random_uuid(), '会長', '子供会の代表者'),
    (gen_random_uuid(), '会計', '金銭管理'),
    (gen_random_uuid(), '書記', '議事録作成')
ON CONFLICT DO NOTHING;

-- Assign a role to a user (You need to replace uuid with a valid profile id)
-- Since we cannot know the UUID easily in SQL script without knowing existing users,
-- We will rely on manual assignment or create a temporary server action to "become officer".
-- BUT, for now, let's create a "seeding" action instead of SQL script to run via browser.
