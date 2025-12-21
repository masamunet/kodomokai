import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { submitRsvp } from '../../actions/rsvp'
import { EventDetailScreen } from '@/components/screens/events/EventDetail'

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (!event) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  let children: any[] = []
  const participantMap: Record<string, any> = {}

  if (user) {
    const { data: userChildren } = await supabase
      .from('children')
      .select('*')
      .eq('parent_id', user.id)
      .order('birthday', { ascending: true })

    children = userChildren || []

    if (children.length > 0) {
      const { data: participants } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', id)
        .eq('profile_id', user.id)
        .not('child_id', 'is', null)

      if (participants) {
        participants.forEach(p => {
          if (p.child_id) participantMap[p.child_id] = p
        })
      }
    }
  }

  return (
    <EventDetailScreen
      event={event}
      childList={children}
      participantMap={participantMap}
      submitRsvp={submitRsvp}
    />
  )
}
