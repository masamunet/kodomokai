'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient as createAuthClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

// Helper to get admin client
const getAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// --- Profile Management ---

export async function adminUpdateProfile(formData: FormData) {
  // Check auth first
  const supabaseAuth = await createAuthClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) {
    return { success: false, message: '認証されていません' }
  }

  const supabase = getAdminClient()
  const id = formData.get('id') as string

  if (!id) {
    return { success: false, message: 'IDが指定されていません' }
  }

  const lastName = formData.get('last_name') as string
  const firstName = formData.get('first_name') as string
  const lastNameKana = formData.get('last_name_kana') as string
  const firstNameKana = formData.get('first_name_kana') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string
  const email = formData.get('email') as string // Email update support if needed, mostly for display
  // Note: updating email in auth.users is separate, here we update profile table.
  // Ideally, email sync should happen, but for now we focus on profile fields.

  const fullName = `${lastName} ${firstName}`

  const { error } = await supabase
    .from('profiles')
    .update({
      last_name: lastName,
      first_name: firstName,
      last_name_kana: lastNameKana,
      first_name_kana: firstNameKana,
      full_name: fullName,
      phone,
      address,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) {
    console.error('Update profile error:', error)
    return { success: false, message: 'プロフィールの更新に失敗しました: ' + error.message }
  }

  revalidatePath(`/admin/users/${id}`)
  return { success: true, message: 'プロフィールを更新しました' }
}

// --- Child Management ---

export async function adminAddChild(formData: FormData) {
  // Check auth
  const supabaseAuth = await createAuthClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) redirect('/login')

  const supabase = getAdminClient()
  const parentId = formData.get('parent_id') as string

  if (!parentId) {
    return { success: false, message: '親IDが指定されていません' }
  }

  const lastName = formData.get('last_name') as string
  const firstName = formData.get('first_name') as string
  const lastNameKana = formData.get('last_name_kana') as string
  const firstNameKana = formData.get('first_name_kana') as string
  const gender = formData.get('gender') as string
  const birthday = formData.get('birthday') as string
  const allergies = formData.get('allergies') as string
  const notes = formData.get('notes') as string

  const fullName = `${lastName} ${firstName}`

  const { error } = await supabase
    .from('children')
    .insert({
      parent_id: parentId,
      last_name: lastName,
      first_name: firstName,
      last_name_kana: lastNameKana,
      first_name_kana: firstNameKana,
      full_name: fullName,
      gender,
      birthday: birthday || null,
      allergies,
      notes,
    })

  if (error) {
    console.error('Add child error:', error)
    return { success: false, message: 'お子様の追加に失敗しました: ' + error.message }
  }

  revalidatePath(`/admin/users/${parentId}`)
  redirect(`/admin/users/${parentId}`)
}

export async function adminUpdateChild(formData: FormData) {
  // Check auth
  const supabaseAuth = await createAuthClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) redirect('/login')

  const supabase = getAdminClient()
  const childId = formData.get('child_id') as string
  const parentId = formData.get('parent_id') as string

  if (!childId) {
    return { success: false, message: '子供IDが指定されていません' }
  }

  const lastName = formData.get('last_name') as string
  const firstName = formData.get('first_name') as string
  const lastNameKana = formData.get('last_name_kana') as string
  const firstNameKana = formData.get('first_name_kana') as string
  const gender = formData.get('gender') as string
  const birthday = formData.get('birthday') as string
  const allergies = formData.get('allergies') as string
  const notes = formData.get('notes') as string

  const fullName = `${lastName} ${firstName}`

  const { error } = await supabase
    .from('children')
    .update({
      last_name: lastName,
      first_name: firstName,
      last_name_kana: lastNameKana,
      first_name_kana: firstNameKana,
      full_name: fullName,
      gender,
      birthday: birthday || null,
      allergies,
      notes,
      updated_at: new Date().toISOString()
    })
    .eq('id', childId)

  if (error) {
    console.error('Update child error:', error)
    return { success: false, message: 'お子様の更新に失敗しました: ' + error.message }
  }

  revalidatePath(`/admin/users/${parentId}`)
  redirect(`/admin/users/${parentId}`)
}

export async function adminDeleteChild(formData: FormData) {
  // Check auth
  const supabaseAuth = await createAuthClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) return { success: false, message: '認証されていません' }

  const supabase = getAdminClient()
  const childId = formData.get('child_id') as string
  const parentId = formData.get('parent_id') as string

  if (!childId) return { success: false, message: 'IDが指定されていません' }

  const { error } = await supabase.from('children').delete().eq('id', childId)

  if (error) {
    console.error('Delete child error:', error)
    return { success: false, message: '削除に失敗しました: ' + error.message }
  }

  revalidatePath(`/admin/users/${parentId}`)
  return { success: true, message: '削除しました' }
}
