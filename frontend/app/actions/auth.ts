'use server'

import { createClient } from '@/lib/supabase/server'
import { RegistrationData } from '../(auth)/register/onboarding/RegistrationWizard'
import { getBaseUrl } from '@/lib/utils'

export async function sendMagicLink(email: string) {
  const supabase = await createClient()

  // Check if user already exists in profiles
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (existingProfile) {
    return {
      success: false,
      code: 'ALREADY_REGISTERED',
      message: 'このメールアドレスは既に登録されています。'
    }
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${getBaseUrl()}/auth/callback?next=/register/onboarding`,
      shouldCreateUser: true,
    }
  })

  if (error) {
    return { success: false, message: error.message }
  }

  return { success: true, message: '確認メールを送信しました' }
}

export async function sendPasswordResetEmail(email: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getBaseUrl()}/auth/callback?next=/update-password`,
  })

  if (error) {
    return { success: false, message: error.message }
  }

  return { success: true, message: 'パスワード再設定用のメールを送信しました' }
}

export async function completeRegistration(data: RegistrationData) {
  const supabase = await createClient()

  // 1. Get current user (should be logged in via magic link)
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, message: 'ログインセッションが切れています。もう一度メール認証からやり直してください。' }
  }

  // 2. Set Password for the user (only if provided, i.e., non-OAuth flow)
  if (data.account.password) {
    const { error: passwordError } = await supabase.auth.updateUser({
      password: data.account.password
    })

    if (passwordError) {
      if (!passwordError.message.includes('New password should be different')) {
        return { success: false, message: 'パスワードの設定に失敗しました: ' + passwordError.message }
      }
    }
  }

  // 3. Update Profile
  const profileData = {
    id: user.id,
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
    .update(profileData)
    .eq('id', user.id)

  if (profileError) {
    console.error('Profile Upsert Error:', profileError)
    // Continue anyway? Or fail? Better to fail.
    return { success: false, message: 'プロフィールの保存に失敗しました' }
  }

  // 4. Insert Children
  if (data.children.length > 0) {
    const childrenData = data.children.map(child => ({
      parent_id: user.id,
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
      return { success: false, message: 'お子様情報の保存に失敗しました' }
    }
  }

  return { success: true }
}
