import Link from 'next/link'
import FiscalYearSwitcher from '@/components/FiscalYearSwitcher'
import { MessageCircleQuestion, HelpCircle, ChevronRight } from 'lucide-react'
import GoogleCalendarButton from '@/components/GoogleCalendarButton'
import { Box } from '@/ui/layout/Box'
import { Stack, HStack } from '@/ui/layout/Stack'
import { Text } from '@/ui/primitives/Text'
import { Heading } from '@/ui/primitives/Heading'
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/primitives/Card'

interface DashboardScreenProps {
  currentUser: any
  profile: any
  associationName: string
  unreadNotifications: any[]
  targetFiscalYear: number
  events: any[]
  officerRoles: any[]
  officerTasks: any[]
  unansweredCount: number
  childrenData: any[]
  eventAttendanceMap: Map<string, Set<string>>
}

export function DashboardScreen({
  currentUser,
  profile,
  associationName,
  unreadNotifications,
  targetFiscalYear,
  events,
  officerRoles,
  officerTasks,
  unansweredCount,
  childrenData,
  eventAttendanceMap,
}: DashboardScreenProps) {
  return (
    <Box className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <Box className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <HStack className="gap-4">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">ダッシュボード</h1>
            <FiscalYearSwitcher currentYear={targetFiscalYear} />
          </HStack>
          <div className="flex gap-2 sm:gap-4 items-center flex-wrap justify-center">
            <Link href="/forum" className="text-sm font-semibold leading-6 text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2 hover:bg-indigo-100 transition-colors flex items-center gap-2">
              <MessageCircleQuestion size={18} />
              質問掲示板
            </Link>
            {profile?.is_admin && (
              <Link href="/admin/templates" className="text-sm font-semibold leading-6 text-gray-900 border rounded-lg px-3 py-2 hover:bg-gray-50 flex items-center gap-2 text-xs">
                管理者メニューへ
              </Link>
            )}
            <Link href="/profile" className="text-sm font-semibold leading-6 text-gray-900 border rounded-lg px-3 py-2 hover:bg-gray-50 flex items-center gap-2 text-xs">
              マイページ
            </Link>
            <form action="/auth/signout" method="post">
              <button className="text-sm font-semibold leading-6 text-gray-900 border rounded-lg px-3 py-2 hover:bg-gray-50 flex items-center gap-2 text-xs">
                ログアウト
              </button>
            </form>
          </div>
        </Box>
      </header>
      <main>
        <Box className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">

          {/* Officer Dashboard Section */}
          {(officerRoles && officerRoles.length > 0) && (
            <Box className="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <h2 className="text-lg font-bold text-indigo-900">役員メニュー ({targetFiscalYear}年度)</h2>
                  <p className="text-sm text-indigo-700 mt-1">
                    現在の役職: {officerRoles.map((r: any) => r.role?.name).join(', ')}
                  </p>
                  {unansweredCount > 0 && (
                    <Link href="/forum" className="inline-flex items-center gap-1.5 mt-2 bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-bold hover:bg-pink-200 transition-colors">
                      <HelpCircle size={14} />
                      未回答の質問が {unansweredCount} 件あります
                    </Link>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
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
            </Box>
          )}

          {/* Notifications Section */}
          <Box className="mb-8">
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
          </Box>

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
                    {events?.map((event) => {
                      const isCanceled = event.is_canceled
                      const status = event.public_status || (event.is_tentative ? 'date_undecided' : 'finalized')

                      return (
                        <li key={event.id} className={`group relative hover:bg-gray-50 ${isCanceled ? 'bg-gray-50' : ''}`}>
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              {/* Main Content Area - Clickable via absolute link */}
                              <div className="flex flex-col relative z-0">
                                <Link href={`/events/${event.id}`} className="absolute inset-0 z-10 w-full h-full focus:outline-none">
                                  <span className="sr-only">イベント詳細を見る</span>
                                </Link>
                                <div className="flex items-center gap-2 mb-1 pointer-events-none">
                                  {status === 'draft' && (
                                    <span className="inline-flex items-center rounded-md bg-gray-100 px-1.5 py-0.5 text-xs font-bold text-gray-600 ring-1 ring-inset ring-gray-500/10">下書き</span>
                                  )}
                                  {isCanceled && (
                                    <span className="inline-flex items-center rounded-md bg-red-50 px-1.5 py-0.5 text-xs font-bold text-red-700 ring-1 ring-inset ring-red-600/10">中止</span>
                                  )}
                                  {status === 'details_undecided' && !isCanceled && (
                                    <span className="inline-flex items-center rounded-md bg-yellow-50 px-1.5 py-0.5 text-xs font-bold text-yellow-700 ring-1 ring-inset ring-yellow-600/10">詳細未定</span>
                                  )}

                                  {/* Child Attendance Icons */}
                                  {childrenData && childrenData.length > 0 && !isCanceled && (
                                    <div className="flex items-center gap-1 ml-1" title="出席状況">
                                      {(childrenData || []).map(child => {
                                        const isAttending = eventAttendanceMap.get(event.id)?.has(child.id)
                                        return (
                                          <div
                                            key={child.id}
                                            title={`${child.first_name}: ${isAttending ? '参加' : '参加しない'}`}
                                            className={`
                                              flex items-center justify-center w-5 h-5 rounded-full border 
                                              ${isAttending
                                                ? 'bg-green-100 border-green-200 text-green-700'
                                                : 'bg-gray-50 border-gray-200 text-gray-300'
                                              }
                                            `}
                                          >
                                            <span className="text-[10px] font-bold">
                                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isAttending ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                                                <circle cx="12" cy="12" r="10" />
                                              </svg>
                                            </span>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  )}

                                  <p className={`text-sm font-bold text-indigo-600 truncate ${isCanceled ? 'line-through opacity-50' : ''}`}>{event.title}</p>
                                </div>
                                <p className={`mt-1 text-xs text-gray-500 pointer-events-none ${isCanceled ? 'line-through opacity-50' : ''}`}>
                                  {status === 'date_undecided' ? (
                                    <span className="text-pink-600 font-bold">【日時未定】</span>
                                  ) : (
                                    <>
                                      {new Date(event.scheduled_date).toLocaleDateString()} {event.start_time ? event.start_time.slice(0, 5) : ''}
                                    </>
                                  )}
                                  {event.location && ` @ ${event.location}`}
                                </p>
                              </div>

                              {/* Right Side Actions - z-index higher than link to be clickable */}
                              <div className="flex items-center gap-3 relative z-20">
                                {!isCanceled && !event.is_tentative && (
                                  <GoogleCalendarButton
                                    title={event.title}
                                    description={event.description}
                                    date={event.scheduled_date}
                                    startTime={event.start_time}
                                    location={event.location}
                                    associationName={associationName}
                                  />
                                )}

                                {event.rsvp_required && !isCanceled ? (
                                  <span className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                                    詳細・出欠
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center rounded-md bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-500 border border-gray-200">
                                    {isCanceled ? '受付停止' : '自由参加'}
                                  </span>
                                )}
                                <ChevronRight className="h-5 w-5 text-gray-400" aria-hidden="true" />
                              </div>
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>

        </Box>
      </main>
    </Box>
  )
}
