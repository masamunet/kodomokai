import { createClient } from '@/lib/supabase/server'
import { getTargetFiscalYear } from '@/lib/fiscal-year'
import { getUnansweredCount } from '@/app/actions/forum'
import { DashboardScreen } from '@/components/screens/Dashboard'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const currentUser = user!

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', currentUser.id)
    .single()

  const { data: settings } = await supabase.from('organization_settings').select('name').single()
  const associationName = settings?.name || '子供会'

  const { data: unreadNotifications } = await supabase
    .from('notification_recipients')
    .select(`
      id,
      is_read,
      read_token,
      notification: notifications(
        id,
        subject,
        sent_at
      )
    `)
    .eq('profile_id', currentUser.id)
    .eq('is_read', false)
    .order('created_at', { ascending: false })

  const targetFiscalYear = await getTargetFiscalYear()
  const today = new Date().toISOString().split('T')[0]

  const startOfFiscalYear = `${targetFiscalYear}-04-01`

  const { data: upcomingEvents } = await supabase
    .from('events')
    .select('*')
    .gte('scheduled_date', today)
    .order('scheduled_date', { ascending: true })

  const { data: pastTentativeEvents } = await supabase
    .from('events')
    .select('*')
    .eq('is_tentative', true)
    .gte('scheduled_date', startOfFiscalYear)
    .lt('scheduled_date', today)
    .order('scheduled_date', { ascending: true })

  let events = [...(pastTentativeEvents || []), ...(upcomingEvents || [])]

  const seenIds = new Set()
  events = events.filter(e => {
    if (seenIds.has(e.id)) return false
    seenIds.add(e.id)
    return true
  })

  events.sort((a, b) => {
    if (a.scheduled_date === b.scheduled_date) {
      return (a.start_time || '') > (b.start_time || '') ? 1 : -1
    }
    return a.scheduled_date > b.scheduled_date ? 1 : -1
  })

  const { data: children } = await supabase
    .from('children')
    .select('id, first_name')
    .eq('parent_id', currentUser.id)
    .order('birthday', { ascending: true })

  const eventIds = events.map(e => e.id)
  const eventAttendanceMap = new Map<string, Set<string>>()

  if (currentUser && eventIds.length > 0 && children && children.length > 0) {
    const { data: participations } = await supabase
      .from('event_participants')
      .select('event_id, child_id')
      .eq('profile_id', currentUser.id)
      .eq('status', 'attending')
      .in('event_id', eventIds)

    if (participations) {
      participations.forEach(p => {
        if (p.child_id) {
          if (!eventAttendanceMap.has(p.event_id)) {
            eventAttendanceMap.set(p.event_id, new Set())
          }
          eventAttendanceMap.get(p.event_id)!.add(p.child_id)
        }
      })
    }
  }

  const { data: officerRoles } = await supabase
    .from('officer_role_assignments')
    .select(`
      *,
      role: officer_roles(*)
    `)
    .eq('profile_id', currentUser.id)
    .eq('fiscal_year', targetFiscalYear)

  if (!officerRoles || officerRoles.length === 0) {
    events = events.filter(e => e.public_status !== 'draft')
  }

  let officerTasks: any[] = []
  let unansweredCount = 0
  if (officerRoles && officerRoles.length > 0) {
    const roleIds = officerRoles.map(r => r.role_id)
    const { data: tasks } = await supabase
      .from('officer_tasks')
      .select('*')
      .in('role_id', roleIds)
    officerTasks = tasks || []

    unansweredCount = await getUnansweredCount()
  }

  return (
    <DashboardScreen
      currentUser={currentUser}
      profile={profile}
      associationName={associationName}
      unreadNotifications={unreadNotifications || []}
      targetFiscalYear={targetFiscalYear}
      events={events}
      officerRoles={officerRoles || []}
      officerTasks={officerTasks}
      unansweredCount={unansweredCount}
      childrenData={children || []}
      eventAttendanceMap={eventAttendanceMap}
    />
  )
}
