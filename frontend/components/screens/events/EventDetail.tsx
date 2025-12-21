import Link from 'next/link'
import { Calendar as CalendarIcon, MapPin, Clock, ArrowLeft, Info, AlertTriangle, ShieldCheck } from 'lucide-react'
import { Box } from '@/ui/layout/Box'
import { Stack, HStack } from '@/ui/layout/Stack'
import { Text } from '@/ui/primitives/Text'
import { Heading } from '@/ui/primitives/Heading'
import { Button } from '@/ui/primitives/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/Card'
import { Badge } from '@/ui/primitives/Badge'
import { cn } from '@/lib/utils'

type Props = {
  event: any
  childList: any[]
  participantMap: Record<string, any>
  submitRsvp: (formData: FormData) => Promise<void>
}

export function EventDetailScreen({ event, childList, participantMap, submitRsvp }: Props) {
  return (
    <Box className="mx-auto max-w-3xl">
      <Box className="mb-6">
        <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-foreground group" activeScale={true}>
          <Link href="/">
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            ダッシュボードへ戻る
          </Link>
        </Button>
      </Box>

      <Card className="overflow-hidden border-border shadow-lg bg-background">
        <CardHeader className="pb-6 border-b border-border bg-background">
          <Stack className="gap-2">
            <Badge variant={event.type === 'meeting' ? 'outline' : 'secondary'} className="w-fit uppercase tracking-wider text-[10px] font-bold">
              {event.type === 'meeting' ? '定例会' : 'イベント'}
            </Badge>
            <Heading size="h2" className="text-2xl md:text-3xl font-black text-foreground">{event.title}</Heading>
          </Stack>
        </CardHeader>

        <CardContent className="p-0">
          {/* Event Meta Info */}
          <Box className="p-6 md:p-8">
            <Box className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Stack className="gap-2">
                <HStack className="gap-2 items-center text-muted-foreground">
                  <CalendarIcon size={16} />
                  <Text weight="bold" className="text-xs uppercase tracking-widest leading-none">日時</Text>
                </HStack>
                <Text className="text-base text-foreground font-medium pl-6">
                  {new Date(event.scheduled_date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
                  {event.start_time && (
                    <Badge variant="outline" className="ml-2 font-mono bg-muted/30">
                      {event.start_time.slice(0, 5)}〜
                    </Badge>
                  )}
                </Text>
              </Stack>

              <Stack className="gap-2">
                <HStack className="gap-2 items-center text-muted-foreground">
                  <MapPin size={16} />
                  <Text weight="bold" className="text-xs uppercase tracking-widest leading-none">場所</Text>
                </HStack>
                <Text className="text-base text-foreground font-medium pl-6">
                  {event.location || '未定'}
                </Text>
              </Stack>

              <Stack className="gap-2 md:col-span-2 pt-4 border-t border-border/50">
                <HStack className="gap-2 items-center text-muted-foreground">
                  <Info size={16} />
                  <Text weight="bold" className="text-xs uppercase tracking-widest leading-none">詳細内容</Text>
                </HStack>
                <Box className="pl-6">
                  <Text className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
                    {event.description || '詳細情報はまだありません。'}
                  </Text>
                </Box>
              </Stack>
            </Box>
          </Box>

          {/* RSVP Section */}
          {event.rsvp_required && (
            <Box className="border-t border-border bg-primary/5 p-6 md:p-8">
              <HStack className="justify-between items-center mb-6">
                <Heading size="h3" className="text-xl font-bold text-primary flex items-center gap-2">
                  <ShieldCheck size={24} />
                  出欠登録
                </Heading>
                {event.rsvp_deadline && (
                  <Badge variant="destructive" className="animate-pulse shadow-sm">
                    締切: {new Date(event.rsvp_deadline).toLocaleDateString()}
                  </Badge>
                )}
              </HStack>

              {childList.length === 0 ? (
                <Card className="bg-destructive/5 border-destructive/20">
                  <CardContent className="p-6">
                    <HStack className="gap-4 items-center text-destructive">
                      <AlertTriangle size={24} className="shrink-0" />
                      <Stack className="gap-1">
                        <Text weight="bold">お子様の情報が登録されていません</Text>
                        <Text className="text-sm opacity-80">「マイページ」からお子様を登録してください。</Text>
                      </Stack>
                    </HStack>
                    <Button variant="link" asChild className="mt-4 p-0 h-auto text-destructive font-bold underline">
                      <Link href="/profile">マイページへ進む →</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <form action={submitRsvp}>
                  <input type="hidden" name="event_id" value={event.id} />
                  <Stack className="gap-3">
                    <Box className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden divide-y divide-border">
                      {childList.map(child => {
                        const rsvp = participantMap[child.id]
                        const isAttending = rsvp?.status === 'attending'

                        return (
                          <Box key={child.id} className="p-4 hover:bg-muted/30 transition-colors group">
                            <label htmlFor={`status_${child.id}`} className="flex items-center justify-between cursor-pointer">
                              <HStack className="gap-4">
                                <Box className="relative">
                                  <input
                                    type="checkbox"
                                    id={`status_${child.id}`}
                                    name={`status_${child.id}`}
                                    value="attending"
                                    defaultChecked={isAttending}
                                    className="peer h-6 w-6 rounded border-border text-primary focus:ring-primary focus:ring-offset-2 transition-all cursor-pointer accent-primary"
                                  />
                                </Box>
                                <Stack className="gap-0.5">
                                  <Text weight="bold" className="text-lg group-hover:text-primary transition-colors">
                                    {child.full_name} <Text asChild className="text-xs font-normal text-muted-foreground ml-1">さん</Text>
                                  </Text>
                                  <Text className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                                    {isAttending ? '参加予定' : '未定（チェックで参加）'}
                                  </Text>
                                </Stack>
                              </HStack>
                              {isAttending && (
                                <Badge variant="success" className="h-6 px-2 text-[10px] font-bold">ATTENDING</Badge>
                              )}
                            </label>
                          </Box>
                        )
                      })}
                    </Box>

                    <Box className="pt-4 flex justify-end">
                      <Button
                        type="submit"
                        className="w-full sm:w-auto h-12 px-12 font-bold text-lg shadow-xl shadow-primary/20"
                        activeScale={true}
                      >
                        登録内容を保存する
                      </Button>
                    </Box>
                  </Stack>
                </form>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
