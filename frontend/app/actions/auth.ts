'use server'

import { createClient } from '@/lib/supabase/server'
import { RegistrationData } from '../(auth)/register/RegistrationWizard'

export async function registerUser(data: RegistrationData) {
  const supabase = await createClient()

  // 1. Sign Up
  // Pass metadata so that trigger can populate profile if configured, 
  // or we can use it to insert manually if we have service role (which we don't here effectively without admin client).
  // Assuming standard flow: SignUp -> Trigger creates Profile -> We update Profile.
  // OR: SignUp -> We insert Profile (if policy allows).

  // Let's use metadata for Profile data to be safe and robust, 
  // IF there is a trigger that copies metadata.
  // If not, we will try to insert/update 'profiles' table directly.

  const { error: signUpError, data: authData } = await supabase.auth.signUp({
    email: data.account.email,
    password: data.account.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback`,
      data: {
        last_name: data.parent.lastName,
        first_name: data.parent.firstName,
        last_name_kana: data.parent.lastNameKana,
        first_name_kana: data.parent.firstNameKana,
        full_name: `${data.parent.lastName} ${data.parent.firstName}`,
        phone: data.parent.phone,
      }
    }
  })

  if (signUpError) {
    console.error('SignUp Error:', signUpError)
    return { success: false, message: signUpError.message }
  }

  if (!authData.user) {
    return { success: false, message: 'ユーザー作成に失敗しました' }
  }

  const userId = authData.user.id

  // 2. Update Profile (or Insert if trigger didn't catch it / doesn't exist)
  // We try to UPDATE first, assuming a trigger might have created a row.
  // If update returns 0 rows, we might need to INSERT.
  // Actually, 'upsert' is safest.

  const profileData = {
    id: userId,
    last_name: data.parent.lastName,
    first_name: data.parent.firstName,
    last_name_kana: data.parent.lastNameKana,
    first_name_kana: data.parent.firstNameKana,
    full_name: `${data.parent.lastName} ${data.parent.firstName}`,
    phone: data.parent.phone,
    address: data.parent.address,
    updated_at: new Date().toISOString(),
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert(profileData)

  if (profileError) {
    console.error('Profile Upsert Error:', profileError)
    // If we fail here, the user is created but profile is missing/incomplete.
    // We might want to return error but the user exists.
    return { success: false, message: 'プロフィールの保存に失敗しました: ' + profileError.message }
  }

  // 3. Insert Children
  if (data.children.length > 0) {
    const childrenData = data.children.map(child => ({
      parent_id: userId,
      last_name: child.lastName,
      first_name: child.firstName,
      last_name_kana: child.lastNameKana,
      first_name_kana: child.firstNameKana,
      full_name: `${child.lastName} ${child.firstName}`,
      gender: child.gender,
      birthday: child.birthday,
      allergies: child.allergies,
      notes: child.notes
    }))

    const { error: childrenError } = await supabase
      .from('children')
      .insert(childrenData)

    if (childrenError) {
      console.error('Children Insert Error:', childrenError)
      return { success: false, message: 'お子様情報の保存に失敗しました: ' + childrenError.message }
    }
  }

  return { success: true }
}
