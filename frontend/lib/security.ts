
import { createClient } from './supabase/server'

/**
 * 認証を必須とし、ユーザーを返します。
 * 未認証の場合はエラーをスローします。
 */
export async function requireAuth() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('Authentication required')
  }

  return user
}

/**
 * 管理者（役員）権限を必須とします。
 * 役員としての割り当てがない場合はエラーをスローします。
 */
export async function requireOfficer() {
  const user = await requireAuth()
  const supabase = await createClient()

  // 役員割り当てテーブルにレコードがあるか確認
  const { data: assignments, error } = await supabase
    .from('officer_role_assignments')
    .select('id')
    .eq('profile_id', user.id)
    .limit(1)

  if (error || !assignments || assignments.length === 0) {
    throw new Error('Officer permission required')
  }

  return user
}
