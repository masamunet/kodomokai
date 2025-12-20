
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireOfficer } from '@/lib/security'

export async function createEvent(formData: FormData) {
  await requireOfficer()
  const supabase = await createClient()

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const start_time = formData.get('start_time') as string
  const location = formData.get('location') as string
  const type = formData.get('type') as string
  const rsvp_required = formData.get('rsvp_required') === 'on'
  const rsvp_deadline = formData.get('rsvp_deadline') as string || null

  const { error } = await supabase
    .from('events')
    .insert({
      title,
      description,
      start_time, // ISO string expected
      end_time: formData.get('end_time') as string || null,
      location,
      type,
      rsvp_required,
      rsvp_deadline,
      created_by: (await supabase.auth.getUser()).data.user?.id,
    })

  if (error) {
    console.error('Create event error:', error)
    return { success: false, message: 'イベントの作成に失敗しました: ' + error.message }
  }

  revalidatePath('/admin/events')
  redirect('/admin/events')
}
