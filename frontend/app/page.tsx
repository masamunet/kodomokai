
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { getTargetFiscalYear } from '@/lib/fiscal-year'
import FiscalYearSwitcher from '@/components/FiscalYearSwitcher'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="p-8">
        <p>ログインしてください</p>
        <Link href="/login" className="text-indigo-600">ログイン画面へ</Link>
      </div>
    )
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get unread notifications
  const { data: unreadNotifications } = await supabase
    .from('notification_recipients')
    .select(`
      id,
      is_read,
      read_token,
      notification:notifications (
        id,
        subject,
        sent_at
      )
    `)
    .eq('profile_id', user.id)
    .eq('is_read', false)
    .order('created_at', { ascending: false })

  // Get target fiscal year
  const targetFiscalYear = await getTargetFiscalYear()

  // Get upcoming events
  // Add logic to filter by fiscal year? 
  // Events usually are just valid by date. "Fiscal Year" helps primarily for Officer roles, Budget, etc.
  // But maybe we should show events for that year? 
  // For now, "Upcoming events" on dashboard are probably always "Future from NOW", regardless of selected FY context.
  // BUT the user requirements say "Principally process in current FY, but can go back".
  // If I go back to 2024, maybe I want to see 2024 events?
  // Let's assume Dashboard "Upcoming" is always "Real-time Upcoming", but we show the switcher for context sensitive pages.
  // Wait, if I change FY, I expect the "Officer Menu" to show *that year's* role.

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .gte('scheduled_date', new Date().toISOString().split('T')[0])
    .order('scheduled_date', { ascending: true })
    .limit(5)

  // Get officer roles FOR THE TARGET FISCAL YEAR
  const { data: officerRoles } = await supabase
    .from('officer_role_assignments')
    .select(`
        *,
        role:officer_roles(*)
    `)
    .eq('profile_id', user.id)
    .eq('fiscal_year', targetFiscalYear) // Use target year

  // ... (rest of logic)

  // Get officer tasks if any role
  let officerTasks: any[] = []
  if (officerRoles && officerRoles.length > 0) {
    const roleIds = officerRoles.map(r => r.role_id)
    const { data: tasks } = await supabase
      .from('officer_tasks')
      .select('*')
      .in('role_id', roleIds)
    officerTasks = tasks || []
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">ダッシュボード</h1>
            <FiscalYearSwitcher currentYear={targetFiscalYear} />
          </div>
          <div className="flex gap-4 items-center">
            {profile?.is_admin && (
              <Link href="/admin/templates" className="text-sm font-semibold leading-6 text-gray-900 border rounded px-3 py-1 hover:bg-gray-50">
                管理者メニューへ
              </Link>
            )}
            <Link href="/profile" className="text-sm font-semibold leading-6 text-gray-900 border rounded px-3 py-1 hover:bg-gray-50">
              マイページ
            </Link>
            <form action="/auth/signout" method="post">
              <button className="text-sm font-semibold leading-6 text-gray-900 border rounded px-3 py-1 hover:bg-gray-50">
                ログアウト
              </button>
            </form>
          </div>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">

          {/* Officer Dashboard Section */}
          {(officerRoles && officerRoles.length > 0) ? (
            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-8">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold text-indigo-900">役員メニュー ({targetFiscalYear}年度)</h2>
                  <p className="text-sm text-indigo-700 mt-1">
                    現在の役職: {officerRoles.map((r: any) => r.role?.name).join(', ')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href="/admin/notifications/new" className="bg-white text-indigo-700 px-3 py-1 rounded text-sm font-semibold shadow-sm border hover:bg-gray-50">
                    お知らせ作成
                  </Link>
                  <Link href="/admin/events/new" className="bg-white text-indigo-700 px-3 py-1 rounded text-sm font-semibold shadow-sm border hover:bg-gray-50">
                    イベント作成
                  </Link>
                  <Link href="/admin/members" className="bg-white text-indigo-700 px-3 py-1 rounded text-sm font-semibold shadow-sm border hover:bg-gray-50">
                    会員名簿
                  </Link>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-semibold text-indigo-900 text-sm mb-2">担当業務</h3>
                {officerTasks.length > 0 ? (
                  <ul className="list-disc list-inside text-sm text-indigo-800 bg-white/50 p-3 rounded">
                    {officerTasks.map(task => (
                      <li key={task.id} className="mb-1">
                        <span className="font-medium">{task.title}</span>
                        {task.due_date && <span className="text-xs ml-2 text-red-600">期限: {new Date(task.due_date).toLocaleDateString()}</span>}
                        <p className="text-xs text-indigo-600 ml-5">{task.description}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-indigo-600">現在登録されている担当業務はありません。</p>
                )}
              </div>
            </div>
          ) : (
            null
          )}

          {/* Notifications Section */}
          <div className="mb-8">
            <h2 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              {unreadNotifications && unreadNotifications.length > 0 ? '未読のお知らせ' : '新しいお知らせはありません'}
            </h2>

            {unreadNotifications && unreadNotifications.length > 0 && (
              <div className="overflow-hidden rounded-md bg-white shadow">
                <ul role="list" className="divide-y divide-gray-200">
                  {unreadNotifications.map((recipient) => {
                    const notification = recipient.notification as any
                    return (
                      <li key={recipient.id} className="px-6 py-4 hover:bg-gray-50">
                        <Link href={`/notifications/read?token=${recipient.read_token}`} className="block">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-indigo-600">{notification?.subject}</span>
                            <span className="text-sm text-gray-500">
                              {new Date(notification?.sent_at).toLocaleDateString()}
                            </span>
                          </div>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="col-span-1 sm:col-span-2 bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="font-semibold text-lg text-gray-900">イベント予定</h3>
              </div>
              <div className="border-t border-gray-200">
                {events?.length === 0 ? (
                  <div className="px-4 py-5 sm:px-6 text-gray-500">直近のイベントはありません。</div>
                ) : (
                  <ul role="list" className="divide-y divide-gray-200">
                    {events?.map((event) => (
                      <li key={event.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <p className="text-sm font-medium text-indigo-600 truncate">{event.title}</p>
                            <p className="mt-1 text-sm text-gray-500">
                              {new Date(event.scheduled_date).toLocaleDateString()} {event.start_time ? event.start_time.slice(0, 5) : ''}
                              {event.location && ` @ ${event.location}`}
                            </p>
                          </div>
                          <div>
                            {event.rsvp_required ? (
                              <Link href={`/events/${event.id}`} className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                                詳細・出欠
                              </Link>
                            ) : (
                              <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1.5 text-sm font-medium text-gray-800">
                                自由参加
                              </span>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
