-- Migration: Simplify RLS and rely on Application-level (SQL) filtering
-- RLSは「ログインしているか」の確認に留め、データの絞り込みはコード側で行います。

-- 1. Profiles (会員情報)
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- 2. Children (子供情報)
DROP POLICY IF EXISTS "Children are viewable by authenticated users" ON public.children;
CREATE POLICY "Children are viewable by authenticated users" ON public.children
  FOR SELECT USING (auth.role() = 'authenticated');

-- 3. Officer Assignments (役員割当)
DROP POLICY IF EXISTS "Assignments are viewable by everyone" ON public.officer_role_assignments;
CREATE POLICY "Assignments are viewable by everyone" ON public.officer_role_assignments
  FOR SELECT USING (auth.role() = 'authenticated');

-- Note: ログインそのものを防ぐ場合は、別のトリガーやミドルウェアを検討します。
