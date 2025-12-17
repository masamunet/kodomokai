
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const lastName = formData.get('last_name') as string
  const firstName = formData.get('first_name') as string
  const lastNameKana = formData.get('last_name_kana') as string
  const firstNameKana = formData.get('first_name_kana') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string

  // Concatenate for backward compatibility or display convenience if needed, 
  // though we should primarily use separate fields now.
  // We keep full_name populated.
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
    .eq('id', user.id)

  if (error) {
    console.error('Update profile error:', error)
    return { success: false, message: 'プロフィールの更新に失敗しました: ' + error.message }
  }

  revalidatePath('/profile')
  return { success: true, message: 'プロフィールを更新しました' }
}

export async function addChild(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
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
      parent_id: user.id,
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

  revalidatePath('/profile')
  redirect('/profile')
}

export async function deleteChild(formData: FormData) {
  const supabase = await createClient()
  const childId = formData.get('child_id') as string

  if (!childId) return { success: false, message: 'IDが指定されていません' }

  const { error } = await supabase.from('children').delete().eq('id', childId)

  if (error) {
    console.error('Delete child error:', error)
    return { success: false, message: '削除に失敗しました: ' + error.message }
  }

  revalidatePath('/profile')
  return { success: true, message: '削除しました' }
}
