
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function submitRsvp(formData: FormData) {
  console.log('--- submitRsvp START ---')
  const supabase = await createClient()

  const event_id = formData.get('event_id') as string
  console.log('Event ID:', event_id)
  // Status inputs are now named `status_{childId}`

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

  // Get all children for this user to validate and iterate
  const { data: children } = await supabase
    .from('children')
    .select('id')
    .eq('parent_id', profile.id)

  if (!children || children.length === 0) {
    return // No children to update
  }

  const updates = []
  const inserts = []

  // Check existing participants
  const { data: existingParticipants } = await supabase
    .from('event_participants')
    .select('id, child_id')
    .eq('event_id', event_id)
    .eq('profile_id', profile.id)

  const existingMap = new Map()
  if (existingParticipants) {
    existingParticipants.forEach(p => {
      if (p.child_id) existingMap.set(p.child_id, p.id)
    })
  }

  console.log('Children found:', children.length)

  for (const child of children) {
    const status = formData.get(`status_${child.id}`) as string
    console.log(`Child ${child.id}: status=${status}`)

    // Checkbox logic:
    // If checked, status is "attending".
    // If unchecked, status is null (or undefined).

    if (status === 'attending') {
      // User wants to attend
      if (existingMap.has(child.id)) {
        console.log(`  -> Update to attending (ID: ${existingMap.get(child.id)})`)
        updates.push({
          id: existingMap.get(child.id),
          status: 'attending',
          updated_at: new Date().toISOString()
        })
      } else {
        console.log(`  -> Insert new attending`)
        inserts.push({
          event_id,
          profile_id: profile.id,
          child_id: child.id,
          status: 'attending',
        })
      }
    } else {
      // User unchecked the box (wants to NOT attend)
      // If a record exists, we should delete it to revert to "no record" state.
      if (existingMap.has(child.id)) {
        console.log(`  -> Delete existing (ID: ${existingMap.get(child.id)})`)
        await supabase
          .from('event_participants')
          .delete()
          .eq('id', existingMap.get(child.id))
      }
      // If no record exists, do nothing
    }
  }

  // Execute Batch Operations
  // Using Promise.all for simplicity
  const promises = []

  if (updates.length > 0) {
    for (const update of updates) {
      const p = supabase
        .from('event_participants')
        .update({ status: update.status, updated_at: update.updated_at })
        .eq('id', update.id)
        .then(({ error }) => { if (error) console.error('Update Error:', error) })
      promises.push(p)
    }
  }

  if (inserts.length > 0) {
    const p = supabase.from('event_participants').insert(inserts)
      .then(({ error }) => { if (error) console.error('Insert Error:', error) })
    promises.push(p)
  }

  await Promise.all(promises)
  console.log('--- submitRsvp END ---')

  revalidatePath(`/events/${event_id}`)
  revalidatePath('/')
}
