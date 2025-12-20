
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
  const start_datetime = formData.get('start_time') as string
  const end_datetime = formData.get('end_time') as string || null
  const location = formData.get('location') as string
  const type = formData.get('type') as string
  const rsvp_required = formData.get('rsvp_required') === 'on' || formData.get('rsvp_required') === 'true'
  const rsvp_deadline = formData.get('rsvp_deadline') as string || null
  const public_status = formData.get('public_status') as string || 'finalized'

  // Extract date and time from datetime-local
  const scheduled_date = start_datetime.split('T')[0]
  const start_time = start_datetime.split('T')[1] || null

  const { error } = await supabase
    .from('events')
    .insert({
      title,
      description,
      scheduled_date,
      start_time,
      scheduled_end_date: end_datetime ? end_datetime.split('T')[0] : null,
      location,
      type,
      rsvp_required,
      rsvp_deadline,
      public_status,
      is_tentative: public_status === 'date_undecided',
      created_by: (await supabase.auth.getUser()).data.user?.id,
    })

  if (error) {
    console.error('Create event error:', error)
    return { success: false, message: 'イベントの作成に失敗しました: ' + error.message }
  }

  revalidatePath('/admin/events')
  revalidatePath('/')
  redirect('/admin/events')
}

export async function updateEvent(formData: FormData) {
  await requireOfficer()
  const supabase = await createClient()

  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const start_datetime = formData.get('start_time') as string
  const end_datetime = formData.get('end_time') as string || null
  const location = formData.get('location') as string
  const type = formData.get('type') as string
  const rsvp_required = formData.get('rsvp_required') === 'on' || formData.get('rsvp_required') === 'true'
  const rsvp_deadline = formData.get('rsvp_deadline') as string || null
  const public_status = formData.get('public_status') as string || 'finalized'

  // Extract date and time from datetime-local
  // datetime-local format: YYYY-MM-DDTHH:mm
  const scheduled_date = start_datetime.split('T')[0]
  const start_time = start_datetime.split('T')[1] || null

  const { error } = await supabase
    .from('events')
    .update({
      title,
      description,
      scheduled_date,
      start_time,
      scheduled_end_date: end_datetime ? end_datetime.split('T')[0] : null,
      location,
      type,
      rsvp_required,
      rsvp_deadline,
      public_status,
      is_tentative: public_status === 'date_undecided',
    })
    .eq('id', id)

  if (error) {
    console.error('Update event error:', error)
    return { success: false, message: 'イベントの更新に失敗しました: ' + error.message }
  }

  revalidatePath('/admin/events')
  revalidatePath(`/admin/events/${id}`)
  revalidatePath('/')
  redirect('/admin/events')
}
