
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createTemplate(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const subject = formData.get('subject') as string
  const body = formData.get('body') as string

  const { error } = await supabase
    .from('notification_templates')
    .insert({ name, subject, body })

  if (error) {
    console.error('Create template error:', error)
    return { success: false, message: 'テンプレートの作成に失敗しました: ' + error.message }
  }

  revalidatePath('/admin/templates')
  redirect('/admin/templates')
}
