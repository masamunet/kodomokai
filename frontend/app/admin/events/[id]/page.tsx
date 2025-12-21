import { createClient } from '@/lib/supabase/server'
import { calculateGrade, getGradeOrder } from '@/lib/grade-utils'
import { getTargetFiscalYear } from '@/lib/fiscal-year'
import { EventDetailScreen } from '@/components/screens/admin/events/EventDetailScreen'

export default async function AdminEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const currentFiscalYear = await getTargetFiscalYear()

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (!event) {
    return <div>イベントが見つかりません</div>
  }

  const { data: participantsRaw } = await supabase
    .from('event_participants')
    .select(`
        *,
        profile:profiles(full_name, email, phone),
        child:children(full_name, last_name, first_name, birthday)
    `)
    .eq('event_id', id)
    .order('created_at', { ascending: true })

  const participants = (participantsRaw || []).map((p: any) => {
    const child = p.child
    const grade = child && child.birthday ? calculateGrade(child.birthday, currentFiscalYear) : ''
    const gradeOrder = getGradeOrder(grade)
    const childName = child ? `${child.last_name || ''} ${child.first_name || ''}`.trim() || child.full_name : '不明な子供'

    return {
      ...p,
      childName,
      grade,
      gradeOrder,
      profile: p.profile
    }
  })

  participants.sort((a: any, b: any) => {
    if (a.gradeOrder !== b.gradeOrder) {
      return a.gradeOrder - b.gradeOrder
    }
    return a.childName.localeCompare(b.childName, 'ja')
  })

  const attendingParticipants = participants.filter((p: any) => p.status === 'attending')
  const attendingCount = attendingParticipants.length

  return (
    <EventDetailScreen
      id={id}
      event={event}
      participants={participants}
      attendingParticipants={attendingParticipants}
      attendingCount={attendingCount}
    />
  )
}
