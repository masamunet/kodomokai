
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function submitRsvp(formData: FormData) {
  const supabase = await createClient()

  const event_id = formData.get('event_id') as string
  const status = formData.get('status') as string // 'attending', 'declined', 'maybe'

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Check if profile exists
  const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).single()
  if (!profile) {
    throw new Error('Profile not found')
  }

  // Check if participant record exists
  const { data: existing } = await supabase
    .from('event_participants')
    .select('id')
    .eq('event_id', event_id)
    .eq('profile_id', profile.id)
    .single()

  if (existing) {
    // Update
    await supabase
      .from('event_participants')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
  } else {
    // Insert
    await supabase
      .from('event_participants')
      .insert({
        event_id,
        profile_id: profile.id,
        status,
      })
  }

  revalidatePath(`/events/${event_id}`)
  revalidatePath('/')
}
