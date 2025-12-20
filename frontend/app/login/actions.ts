
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data: { user }, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect('/error')
  }

  // Check if profile is soft-deleted logic removed (physical delete used now)
  /* 
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('deleted_at')
      .eq('id', user.id)
      .single()

    if (profile?.deleted_at) {
      // If deleted, sign out immediately
      await supabase.auth.signOut()
      redirect('/login?error=account_deleted')
    }
  }
  */

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    console.error('Provider error:', error)
    redirect('/error')
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const lastName = formData.get('last_name') as string
  const firstName = formData.get('first_name') as string
  const lastNameKana = formData.get('last_name_kana') as string
  const firstNameKana = formData.get('first_name_kana') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback`,
      data: {
        last_name: lastName,
        first_name: firstName,
        last_name_kana: lastNameKana,
        first_name_kana: firstNameKana,
        full_name: `${lastName} ${firstName}`
      }
    },
  })

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}
