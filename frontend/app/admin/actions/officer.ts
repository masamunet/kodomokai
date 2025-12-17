
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// --- Role Management ---
export async function createRole(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const display_order = parseInt(formData.get('display_order') as string) || 0

  const { error } = await supabase
    .from('officer_roles')
    .insert({ name, description, display_order })

  if (error) {
    console.error('Create role error:', error)
    return { success: false, message: '役職の作成に失敗しました: ' + error.message }
  }

  revalidatePath('/admin/roles')
  redirect('/admin/roles')
}

export async function updateRole(formData: FormData) {
  const supabase = await createClient()

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const display_order = parseInt(formData.get('display_order') as string)
  const description = formData.get('description') as string

  if (!id) return { success: false, message: 'IDが指定されていません' }

  // Check unique name exclusion? For now simple update.

  const { error } = await supabase
    .from('officer_roles')
    .update({ name, display_order, description })
    .eq('id', id)

  if (error) {
    console.error('Update role error:', error)
    return { success: false, message: '役職の更新に失敗しました: ' + error.message }
  }

  revalidatePath('/admin/roles')
  redirect('/admin/roles')
}

// --- Officer Assignment ---
export async function assignOfficer(formData: FormData) {
  const supabase = await createClient()

  const profile_id = formData.get('profile_id') as string
  const role_id = formData.get('role_id') as string
  const fiscal_year = parseInt(formData.get('fiscal_year') as string)
  const start_date = formData.get('start_date') as string
  const end_date = formData.get('end_date') as string

  const { error } = await supabase
    .from('officer_role_assignments')
    .insert({
      profile_id,
      role_id,
      fiscal_year,
      start_date: start_date || null,
      end_date: end_date || null,
    })

  if (error) {
    console.error('Assign officer error:', error)
    return { success: false, message: '任命に失敗しました: ' + error.message }
  }

  revalidatePath('/admin/officers')
  redirect('/admin/officers')
}

export async function deleteAssignment(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  await supabase.from('officer_role_assignments').delete().eq('id', id)

  revalidatePath('/admin/officers')
}
