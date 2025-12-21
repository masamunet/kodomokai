import Link from 'next/link'
import FiscalYearSwitcher from '@/components/FiscalYearSwitcher'
import { MessageCircleQuestion, HelpCircle, ChevronRight, LogOut, User, LayoutDashboard, Bell, Calendar as CalendarIcon, MapPin, Clock } from 'lucide-react'
import GoogleCalendarButton from '@/components/GoogleCalendarButton'
import { Box } from '@/ui/layout/Box'
import { Stack, HStack } from '@/ui/layout/Stack'
import { Text } from '@/ui/primitives/Text'
import { Heading } from '@/ui/primitives/Heading'
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/primitives/Card'
import { Button } from '@/ui/primitives/Button'
import { Badge } from '@/ui/primitives/Badge'
import { cn } from '@/lib/utils'

interface DashboardScreenProps {
  currentUser: any
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

export function DashboardScreen(props: DashboardScreenProps) {
  return (
    <main>
      {/* Officer Dashboard Section */}
      <OfficerDashboard
        officerRoles={props.officerRoles}
        officerTasks={props.officerTasks}
        targetFiscalYear={props.targetFiscalYear}
        unansweredCount={props.unansweredCount}
      />

      <Box className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Notifications) */}
        <NotificationList unreadNotifications={props.unreadNotifications} />

        {/* Right Column (Events) */}
        <EventList
          events={props.events}
          associationName={props.associationName}
          childrenData={props.childrenData}
          eventAttendanceMap={props.eventAttendanceMap}
        />
      </Box>
    </main>
  )
}

function OfficerDashboard({ officerRoles, officerTasks, targetFiscalYear, unansweredCount }: { officerRoles: any[], officerTasks: any[], targetFiscalYear: number, unansweredCount: number }) {
  if (!officerRoles || officerRoles.length === 0) return null

  return (
    <Card className="mb-10 border-primary/20 bg-primary/5 shadow-md overflow-hidden">
      <CardHeader className="bg-primary/5 border-b border-primary/10 py-4">
        <HStack className="justify-between items-center">
          <HStack className="gap-2 items-center">
            <Box className="bg-primary/20 p-1.5 rounded-md text-primary">
              <LayoutDashboard size={18} />
            </Box>
            <CardTitle className="text-lg font-bold text-primary">役員メニュー ({targetFiscalYear}年度)</CardTitle>
          </HStack>
          <HStack className="gap-2 flex-wrap">
            <Button variant="outline" size="sm" asChild activeScale={true} className="h-8 text-xs bg-background">
              <Link href="/admin/notifications/new">お知らせ作成</Link>
            </Button>
            <Button variant="outline" size="sm" asChild activeScale={true} className="h-8 text-xs bg-background">
              <Link href="/admin/events">イベント管理</Link>
            </Button>
            <Button variant="outline" size="sm" asChild activeScale={true} className="h-8 text-xs bg-background">
              <Link href="/admin/members">会員名簿</Link>
            </Button>
          </HStack>
        </HStack>
      </CardHeader>
      <CardContent className="pt-6">
        <Stack className="gap-6">
          <Box>
            <Text weight="medium" className="text-sm text-muted-foreground mb-1">現在の役職</Text>
            <HStack className="gap-2 flex-wrap">
              {officerRoles.map((r: any) => (
                <Badge key={r.id} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  {r.role?.name}
                </Badge>
              ))}
            </HStack>

            {unansweredCount > 0 && (
              <Box className="mt-4">
                <Button variant="ghost" asChild activeScale={true} className="h-auto py-2 px-4 bg-pink-50 text-pink-700 hover:bg-pink-100 hover:text-pink-800 rounded-xl border border-pink-200/50 gap-2">
                  <Link href="/forum">
                    <Box className="bg-pink-200/50 p-1 rounded-full">
                      <HelpCircle size={14} />
                    </Box>
                    <Text weight="bold" className="text-sm">未回答の質問が {unansweredCount} 件あります</Text>
                    <ChevronRight size={14} className="opacity-50" />
                  </Link>
                </Button>
              </Box>
            )}
          </Box>

          <Box>
            <Heading size="h4" className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <Box className="w-1.5 h-4 bg-primary rounded-full" />
              担当業務
            </Heading>
            {officerTasks.length > 0 ? (
              <Stack className="gap-3">
                {officerTasks.map(task => (
                  <Box key={task.id} className="bg-background/60 p-4 rounded-xl border border-primary/10 hover:border-primary/20 transition-all shadow-sm">
                    <HStack className="justify-between items-start gap-4">
                      <Stack className="gap-1">
                        <Text weight="bold" className="text-foreground">{task.title}</Text>
                        <Text className="text-xs text-muted-foreground leading-relaxed">{task.description}</Text>
                      </Stack>
                      {task.due_date && (
                        <Badge variant="outline" className="text-[10px] py-0 h-5 border-destructive/30 text-destructive bg-destructive/5 gap-1 shrink-0">
                          <Clock size={10} />
                          期限: {new Date(task.due_date).toLocaleDateString()}
                        </Badge>
                      )}
                    </HStack>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Box className="bg-background/40 p-6 text-center rounded-xl border border-dashed border-primary/20">
                <Text className="text-sm text-muted-foreground italic">現在登録されている担当業務はありません。</Text>
              </Box>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}

function NotificationList({ unreadNotifications }: { unreadNotifications: any[] }) {
  return (
    <Box className="lg:col-span-1 space-y-6">
      <Heading size="h2" className="text-lg font-bold text-foreground flex items-center gap-2">
        <Bell size={20} className="text-primary" />
        お知らせ
      </Heading>

      <Stack className="gap-4">
        {unreadNotifications && unreadNotifications.length > 0 ? (
          unreadNotifications.map((recipient) => {
            const notification = recipient.notification as any
            return (
              <Button
                key={recipient.id}
                variant="ghost"
                asChild
                activeScale={true}
                className="h-auto p-0 block text-left bg-background hover:bg-accent/5 transition-all overflow-hidden border border-border rounded-xl shadow-sm group"
              >
                <Link href={`/notifications/read?token=${recipient.read_token}`}>
                  <Box className="p-4 relative">
                    <Box className="absolute top-0 left-0 w-1 h-full bg-primary" />
                    <Stack className="gap-1">
                      <HStack className="justify-between items-center">
                        <Badge className="text-[10px] px-1.5 h-4 bg-primary/10 text-primary border-0">NEW</Badge>
                        <Text className="text-[10px] text-muted-foreground">
                          {new Date(notification?.sent_at).toLocaleDateString()}
                        </Text>
                      </HStack>
                      <Text weight="bold" className="text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {notification?.subject}
                      </Text>
                    </Stack>
                  </Box>
                </Link>
              </Button>
            )
          })
        ) : (
          <Box className="p-10 text-center bg-muted/20 border border-dashed border-border rounded-xl">
            <Text className="text-sm text-muted-foreground italic">新しいお知らせはありません</Text>
          </Box>
        )}
      </Stack>
    </Box>
  )
}

function EventList({ events, associationName, childrenData, eventAttendanceMap }: { events: any[], associationName: string, childrenData: any[], eventAttendanceMap: Map<string, Set<string>> }) {
  return (
    <Box className="lg:col-span-2 space-y-6">
      <Heading size="h2" className="text-lg font-bold text-foreground flex items-center gap-2">
        <CalendarIcon size={20} className="text-primary" />
        今後のイベント
      </Heading>

      <Card className="border-border shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {events?.length === 0 ? (
            <Box className="p-12 text-center">
              <Text className="text-muted-foreground italic">予定されているイベントはありません。</Text>
            </Box>
          ) : (
            <Stack className="divide-y divide-border">
              {events?.map((event) => {
                const isCanceled = event.is_canceled
                const status = event.public_status || (event.is_tentative ? 'date_undecided' : 'finalized')

                return (
                  <Box key={event.id} className={cn("group relative transition-all hover:bg-muted/30", isCanceled && "bg-muted/20 grayscale")}>
                    <Box className="p-5 sm:p-6">
                      <HStack className="justify-between items-start gap-4">
                        <Stack className="gap-3 flex-1 min-w-0">
                          {/* Status Badges */}
                          <HStack className="gap-2 shrink-0">
                            {status === 'draft' && <Badge variant="secondary" className="text-[10px] px-1.5 h-5 font-bold">下書き</Badge>}
                            {isCanceled && <Badge variant="destructive" className="text-[10px] px-1.5 h-5 font-bold">中止</Badge>}
                            {status === 'details_undecided' && !isCanceled && <Badge variant="outline" className="text-[10px] px-1.5 h-5 font-bold border-yellow-500/50 text-yellow-700 bg-yellow-50">詳細未定</Badge>}
                            {status === 'date_undecided' && !isCanceled && <Badge variant="outline" className="text-[10px] px-1.5 h-5 font-bold border-pink-500/50 text-pink-700 bg-pink-50">日時未定</Badge>}

                            {/* Attendance for own children */}
                            {childrenData && childrenData.length > 0 && !isCanceled && (
                              <HStack className="gap-1 ml-auto">
                                {childrenData.map(child => {
                                  const isAttending = eventAttendanceMap.get(event.id)?.has(child.id)
                                  return (
                                    <Box
                                      key={child.id}
                                      title={`${child.first_name}: ${isAttending ? '参加' : '不参加'}`}
                                      className={cn(
                                        "w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold",
                                        isAttending ? "bg-green-100 border-green-300 text-green-700" : "bg-muted border-border text-muted-foreground"
                                      )}
                                    >
                                      {child.first_name[0]}
                                    </Box>
                                  )
                                })}
                              </HStack>
                            )}
                          </HStack>

                          <Box className="relative">
                            <Link href={`/events/${event.id}`} className="absolute inset-0 z-10" />
                            <Stack className="gap-1.5">
                              <Heading size="h3" className={cn("text-lg font-bold group-hover:text-primary transition-colors", isCanceled && "line-through opacity-50")}>
                                {event.title}
                              </Heading>

                              <HStack className="gap-4 text-xs text-muted-foreground flex-wrap">
                                <HStack className="gap-1.5 items-center">
                                  <CalendarIcon size={14} className="text-primary/60" />
                                  {status === 'date_undecided' ? (
                                    <Text weight="bold" className="text-pink-600">日時未定</Text>
                                  ) : (
                                    <Text>{new Date(event.scheduled_date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}</Text>
                                  )}
                                </HStack>

                                {event.start_time && !isCanceled && (
                                  <HStack className="gap-1.5 items-center">
                                    <Clock size={14} className="text-primary/60" />
                                    <Text>{event.start_time.slice(0, 5)}〜</Text>
                                  </HStack>
                                )}

                                {event.location && (
                                  <HStack className="gap-1.5 items-center">
                                    <MapPin size={14} className="text-primary/60" />
                                    <Text className="truncate max-w-[150px]">{event.location}</Text>
                                  </HStack>
                                )}
                              </HStack>
                            </Stack>
                          </Box>
                        </Stack>

                        <Stack className="gap-3 items-end relative z-20">
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

                          <Button variant={event.rsvp_required && !isCanceled ? "default" : "secondary"} size="sm" asChild activeScale={true} className="h-9 px-4 font-bold rounded-lg shadow-sm">
                            <Link href={`/events/${event.id}`}>
                              {event.rsvp_required && !isCanceled ? '詳細・出欠' : '詳細を見る'}
                            </Link>
                          </Button>
                        </Stack>
                      </HStack>
                    </Box>
                  </Box>
                )
              })}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
