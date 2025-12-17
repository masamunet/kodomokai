
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function sendNotification(formData: FormData) {
  const supabase = await createClient()

  const subject = formData.get('subject') as string
  const body = formData.get('body') as string
  const templateId = formData.get('template_id') as string

  // 1. Create Notification Record
  const { data: notification, error: notifError } = await supabase
    .from('notifications')
    .insert({
      subject,
      body,
      template_id: templateId || null,
      created_by: (await supabase.auth.getUser()).data.user?.id,
    })
    .select()
    .single()

  if (notifError || !notification) {
    console.error('Create notification error:', notifError)
    return { success: false, message: 'お知らせの作成に失敗しました: ' + (notifError?.message || '') }
  }

  // 2. Mock Sending Email & Create Recipients
  // In a real app, this would query all active profiles and send emails.
  // For now, we will query all profiles and create recipient records.

  const { data: profiles } = await supabase.from('profiles').select('id, email')

  if (profiles) {
    const recipients = profiles.map((p) => ({
      notification_id: notification.id,
      profile_id: p.id,
    }))

    const { error: recipientError } = await supabase
      .from('notification_recipients')
      .insert(recipients)

    if (recipientError) {
      console.error('Create recipients error:', recipientError)
    }

    // TODO: Send Email logic via Resend here
    // profiles.forEach(p => sendEmail(p.email, subject, body))
  }

  revalidatePath('/admin/notifications')
  redirect('/admin/notifications')
}
