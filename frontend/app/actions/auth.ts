import { createClient } from '@/lib/supabase/server'
import { RegistrationData } from '@/components/registration/onboarding/RegistrationWizard'
import { getBaseUrl } from '@/lib/utils'
import { getTargetFiscalYear } from '@/app/admin/actions/settings'

export async function verifyInvitationCode(code: string) {
  const supabase = await createClient()
  const targetFiscalYear = await getTargetFiscalYear()

  const { data: settings, error } = await supabase
    .from('annual_settings')
    .select('invitation_code')
    .eq('fiscal_year', targetFiscalYear)
    .single()

  if (error || !settings) {
    // If no code is configured for this year, we allow registration OR we block it depending on policy.
    // Given the prompt "設定されてない年度なら環境変数の値で登録できるなど/設定されてない年度なら通す", let's be lenient if no DB row exists.
    // Actually, user said: "設定されてない年度なら環境変数の値で登録できるなど。" meaning fallback to env var logic.
    const fallbackCode = process.env.INVITATION_CODE
    if (fallbackCode) {
      if (code === fallbackCode) {
        return { success: true }
      }
      return { success: false, message: '招待コードが正しくありません' }
    }
    // If neither DB nor ENV is set, we could allow it or block it. Let's allow it as a failsafe so users aren't locked out.
    // Wait, better to block with a friendly message to contact admin if strict lock is intended. Let's block it unless code matches.
    // If no config exists, only allow registration if they don't provide a code? No, we need a code.
    // Let's assume if no settings at all and no code, let them pass if code is empty? No, require code. If no config at all, fallback to env. If no env, error.
    if (!fallbackCode) {
      // No DB, no ENV. 
      return { success: true } // Let's allow registration if administrator hasn't set anything up.
    }
  }

  if (settings && settings.invitation_code !== code) {
    return { success: false, message: '招待コードが正しくありません' }
  }

  return { success: true }
}

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
