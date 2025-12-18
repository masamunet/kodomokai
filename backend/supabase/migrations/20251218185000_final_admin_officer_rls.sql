-- Migration: Final Fix for Member Access (Admins and Officers can see ALL)
-- RLS (Row Level Security) はデータベースレベルでのアクセス制限機能です。

-- 1. 権限チェック関数の定義 (無限再帰を避けるため)
CREATE OR REPLACE FUNCTION public.is_member_admin_or_officer(user_id uuid)
RETURNS boolean AS $$
BEGIN
  -- 管理者(is_admin)または会員編集権限を持つ役員であるか
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND is_admin = true
  ) OR EXISTS (
    SELECT 1 FROM public.officer_role_assignments ora
    JOIN public.officer_roles oroles ON ora.role_id = oroles.id
    WHERE ora.profile_id = user_id AND oroles.can_edit_members = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Profiles (会員情報) のポリシー
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;

CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      deleted_at IS NULL OR                -- 通常会員は削除されていない人だけ見える
      id = auth.uid() OR                    -- 自分自身のデータは見れる
      public.is_member_admin_or_officer(auth.uid()) -- 役員・管理者は削除済みも含め全員分見れる
    )
  );

-- 3. Children (子供情報) のポリシー
DROP POLICY IF EXISTS "Children are viewable by authenticated users" ON public.children;

CREATE POLICY "Children are viewable by authenticated users" ON public.children
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      deleted_at IS NULL OR                -- 通常会員は削除されていない子供だけ見える
      parent_id = auth.uid() OR             -- 自分の子供は見れる
      public.is_member_admin_or_officer(auth.uid()) -- 役員・管理者は削除済みも含め全員分見れる
    )
  );

-- 4. Officer Assignments (役員割当情報) のポリシー
DROP POLICY IF EXISTS "Assignments are viewable by everyone" ON public.officer_role_assignments;

CREATE POLICY "Assignments are viewable by everyone" ON public.officer_role_assignments
  FOR SELECT USING (
    -- 役員自身が削除されていないか、閲覧者が役員・管理者の場合は表示
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = officer_role_assignments.profile_id
      AND (profiles.deleted_at IS NULL OR public.is_member_admin_or_officer(auth.uid()))
    )
  );
