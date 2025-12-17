'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function getAnnualEvents(year: number) {
  const supabase = await createClient()

  // Fiscal year handling: April of `year` to March of `year + 1`
  const startDate = `${year}-04-01`
  const endDate = `${year + 1}-03-31`

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('scheduled_date', startDate)
    .lte('scheduled_date', endDate)
    .order('scheduled_date', { ascending: true })
    .order('start_time', { ascending: true }) // Secondary sort by time if exists

  if (error) {
    console.error('Error fetching annual events:', error)
    return []
  }

  return data
}

export async function upsertEvent(formData: FormData) {
  const supabase = await createClient()

  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const location = formData.get('location') as string
  const scheduled_date = formData.get('scheduled_date') as string
  let start_time = formData.get('start_time') as string | null
  const is_tentative = formData.get('is_tentative') === 'true'

  // If start_time is empty string or "09:00" hidden default when we want "undefined", 
  // we need to handle it. 
  // But wait, the previous code had hidden input "09:00".
  // Now we want optional.
  // We will remove the hidden input in Frontend.
  // So if start_time is empty, treat as null.
  if (!start_time) {
    start_time = null
  } else if (start_time.length === 5) {
    // HH:mm format -> valid for TIME type in Postgres
    // No change needed
  }

  const payload = {
    title,
    description: description || null,
    location: location || null,
    scheduled_date,
    start_time: start_time || null,
    is_tentative,
    type: 'recreation',
    rsvp_required: false,
  }

  let error
  if (id) {
    const { error: updError } = await supabase
      .from('events')
      .update(payload)
      .eq('id', id)
    error = updError
  } else {
    const { data: { user } } = await supabase.auth.getUser()
    const insertPayload = {
      ...payload,
      created_by: user?.id
    }
    const { error: insError } = await supabase
      .from('events')
      .insert(insertPayload)
    error = insError
  }

  if (error) {
    console.error('Upsert event error:', error)
    return { success: false, message: 'イベントの保存に失敗しました: ' + error.message }
  }

  revalidatePath('/admin/events/annual')
  revalidatePath('/admin/events')
  return { success: true, message: 'イベントを保存しました' }
}

export async function deleteEvent(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Delete event error:', error)
    return { success: false, message: 'イベントの削除に失敗しました: ' + error.message }
  }

  revalidatePath('/admin/events/annual')
  revalidatePath('/admin/events')
  return { success: true, message: 'イベントを削除しました' }
}
