import { createClient } from '@/lib/supabase/server'
import { EventListScreen } from '@/components/screens/admin/events/EventListScreen'

export default async function AdminEventsPage() {
  const supabase = await createClient()
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('scheduled_date', { ascending: false })
    .order('start_time', { ascending: true })

  return <EventListScreen events={events || []} />
}
