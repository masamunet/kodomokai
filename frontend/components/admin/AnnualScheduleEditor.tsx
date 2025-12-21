'use client'

import { useState, useTransition, Fragment } from 'react'
import { upsertEvent, deleteEvent } from '@/app/actions/events'
import { Calendar, Trash2, Edit2, Save, X, Printer, Download, Calendar as CalendarIcon, AlertTriangle, ChevronDown, ChevronUp, Plus } from 'lucide-react'
import MarkdownEditor from '@/components/ui/MarkdownEditor'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { toWarekiYear } from '@/lib/date-utils'
import { Box } from '@/ui/layout/Box'
import { Stack, HStack } from '@/ui/layout/Stack'
import { Text } from '@/ui/primitives/Text'
import { Heading } from '@/ui/primitives/Heading'
import { Button } from '@/ui/primitives/Button'
import { Badge } from '../../ui/primitives/Badge'
import { Label } from '@/ui/primitives/Label'
import { Input } from '@/ui/primitives/Input'
import { cn } from '@/lib/utils'

// Extended Event type to include is_tentative and is_canceled
type Event = {
  id: string
  public_status: 'draft' | 'date_undecided' | 'details_undecided' | 'finalized'
  title: string
  description: string | null
  scheduled_date: string // Date string YYYY-MM-DD
  scheduled_end_date: string | null // Date string YYYY-MM-DD or null
  start_time: string | null // Time string HH:MM:SS or null
  location: string | null
  is_tentative: boolean
  is_canceled: boolean
  organizer: string
}

type Props = {
  year: number
  events: Event[]
  eraName: string
  startYear: number
  title?: string
  readOnly?: boolean
}

const MONTHS = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3]

export default function AnnualScheduleEditor({ year, events, eraName, startYear, title, readOnly = false }: Props) {
  const [isPending, startTransition] = useTransition()
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [isAddingMonth, setIsAddingMonth] = useState<number | null>(null)

  const warekiYear = toWarekiYear(year, eraName, startYear)

  const getEventsForMonth = (targetMonth: number) => {
    return events.filter(e => {
      const d = new Date(e.scheduled_date)
      const m = d.getMonth() + 1
      return m === targetMonth
    })
  }

  const handleDownloadIcs = () => {
    const content = generateEventIcs(events)
    const blob = new Blob([content], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `年度活動予定_${year}.ics`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  // Get current date/time for "Last Updated" / edition management
  const now = new Date()
  const printedDate = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours()}:${now.getMinutes() < 10 ? '0' : ''}${now.getMinutes()} 現在`

  return (
    <Stack className="gap-6 print:gap-4">
      <Box className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <Box>
          <Heading size="h2" className="text-2xl font-bold">{warekiYear}度 {title || '年間活動予定'}</Heading>
          <Text className="text-sm text-muted-foreground mt-1 block">
            最終発行: {printedDate}
          </Text>
        </Box>
        <HStack className="gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadIcs}
            className="gap-2 font-bold"
          >
            <Download size={16} /> ICSダウンロード
          </Button>
          <Button
            size="sm"
            onClick={() => window.print()}
            className="gap-2 font-bold shadow-sm"
          >
            <Printer size={16} /> 印刷 / PDF保存
          </Button>
        </HStack>
      </Box>

      <Box className="hidden print:block mb-6 border-b-2 border-primary pb-2">
        <HStack className="justify-between items-end">
          <Heading size="h1" className="text-2xl font-bold text-primary">{warekiYear}度 {title || '年間活動予定表'}</Heading>
          <Text className="text-xs text-muted-foreground">発行日: {printedDate}</Text>
        </HStack>
      </Box>

      {/* Table Structure for Print and Desktop */}
      <Box className="bg-background border border-border rounded-xl overflow-hidden shadow-sm print:border-2 print:border-black">
        <table className="min-w-full divide-y divide-border print:divide-black">
          <thead className="bg-muted/50 print:bg-muted/10">
            <tr>
              <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider w-24 border-r border-border print:border-black print:py-2">月</th>
              <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider w-32 border-r border-border print:border-black print:py-2">日時</th>
              <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider border-r border-border print:border-black print:py-2">イベント名 / 詳細</th>
              <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider w-32 border-r border-border print:border-black print:py-2">場所</th>
              <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider w-24 border-r border-border print:border-black print:py-2">主催</th>
              <th scope="col" className={`px-4 py-4 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider w-20 ${readOnly ? 'hidden' : 'print:hidden'}`}>操作</th>
            </tr>
          </thead>
          <tbody className="bg-background divide-y divide-border print:divide-black">
            {MONTHS.map(month => {
              const monthEvents = getEventsForMonth(month)
              const displayYear = month >= 4 ? year : year + 1

              if (monthEvents.length === 0 && isAddingMonth !== month) {
                return (
                  <tr key={month} className="group hover:bg-muted/30 transition-colors print:break-inside-avoid">
                    <td className="px-4 py-4 text-sm font-bold text-foreground border-r border-border print:border-black bg-muted/20 print:bg-transparent align-top print:py-2">
                      <HStack className="items-center justify-between">
                        <Text weight="bold" className="text-lg">{month}月</Text>
                        {!readOnly && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setIsAddingMonth(month)
                              setEditingEventId(null)
                            }}
                            className="print:hidden h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Plus size={14} />
                          </Button>
                        )}
                      </HStack>
                    </td>
                    <td colSpan={5} className="px-4 py-8 text-center print:py-4">
                      <Text className="text-muted-foreground italic text-sm">予定なし</Text>
                    </td>
                  </tr>
                )
              }

              // Fragments for mapping
              return (
                <Fragment key={month}>
                  {monthEvents.map((event, index) => (
                    <EventRow
                      key={event.id}
                      event={event}
                      year={displayYear}
                      month={month}
                      readOnly={readOnly}
                      rowSpan={monthEvents.length + (isAddingMonth === month ? 1 : 0)}
                      isEditing={editingEventId === event.id}
                      onEdit={() => setEditingEventId(event.id)}
                      onCancel={() => setEditingEventId(null)}
                      onAdd={() => setIsAddingMonth(month)}
                      showMonthCell={index === 0}
                    />
                  ))}
                  {isAddingMonth === month && !readOnly && (
                    <tr className="bg-indigo-50 border-t-2 border-indigo-200 print:hidden">
                      {monthEvents.length === 0 && (
                        <td className="px-3 py-4 text-sm font-bold text-gray-900 border-r border-gray-200 bg-gray-50 align-top">
                          {month}月
                        </td>
                      )}
                      <td colSpan={5} className="p-4">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-200">
                          <h4 className="font-bold text-indigo-700 mb-3 flex items-center gap-2">
                            <CalendarIcon size={16} /> {toWarekiYear(displayYear, eraName, startYear)} {month}月 新規イベント追加
                          </h4>
                          <EventForm
                            year={displayYear}
                            month={month}
                            onCancel={() => setIsAddingMonth(null)}
                            onComplete={() => setIsAddingMonth(null)}
                          />
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </Box>
    </Stack>
  )
}

function EventRow({
  event,
  year,
  month,
  isEditing,
  onEdit,
  onCancel,
  showMonthCell,
  rowSpan,
  onAdd,
  readOnly
}: {
  event: Event,
  year: number,
  month: number,
  isEditing: boolean,
  onEdit: () => void,
  onCancel: () => void
  showMonthCell: boolean
  rowSpan: number
  onAdd: () => void
  readOnly: boolean
}) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = async () => {
    if (!confirm('本当に削除しますか？')) return
    const formData = new FormData()
    formData.append('id', event.id)
    startTransition(async () => {
      await deleteEvent(formData)
    })
  }

  if (isEditing) {
    return (
      <tr className="bg-primary/5 print:hidden">
        {showMonthCell && (
          <td rowSpan={rowSpan} className="px-4 py-4 text-sm font-bold text-foreground border-r border-border align-top bg-muted/20">
            <Text weight="bold" className="text-lg">{month}月</Text>
          </td>
        )}
        <td colSpan={5} className="p-4">
          <Box className="bg-background p-6 rounded-xl border border-primary/20 shadow-lg">
            <Heading size="h4" className="text-primary mb-4 flex items-center gap-2">
              <Edit2 size={18} /> イベントの編集
            </Heading>
            <EventForm
              event={event}
              year={year}
              month={month}
              onCancel={onCancel}
              onComplete={onCancel}
            />
          </Box>
        </td>
      </tr>
    )
  }

  const eventDate = new Date(event.scheduled_date)
  const timeString = event.start_time ? event.start_time.slice(0, 5) : null
  const dayName = ['日', '月', '火', '水', '木', '金', '土'][eventDate.getDay()]

  const isCanceled = event.is_canceled
  const publicStatus = event.public_status || (event.is_tentative ? 'date_undecided' : 'finalized')

  const rowClass = isCanceled
    ? 'bg-muted/50 text-muted-foreground print:bg-muted/10'
    : (publicStatus === 'draft' ? 'bg-muted/30 border-l-4 border-muted-foreground/30' : 'bg-background')
  const textDecoration = isCanceled ? 'line-through' : ''

  const googleCalUrl = getGoogleCalendarUrl(event)

  return (
    <tr className={`${rowClass} hover:bg-muted/30 group print:break-inside-avoid transition-colors`}>
      {showMonthCell && (
        <td rowSpan={rowSpan} className="px-4 py-4 text-sm font-bold text-foreground border-r border-border print:border-black align-top bg-muted/20 print:bg-transparent min-w-[3rem] print:py-2">
          <Box className="flex justify-between print:justify-center">
            <Text weight="bold" className="text-xl print:text-base">{month}</Text>
            <Text className="text-xs pt-1.5 print:hidden text-muted-foreground">月</Text>
            {(!readOnly) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onAdd}
                className="print:hidden h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                title="この月に追加"
              >
                <Plus size={14} />
              </Button>
            )}
          </Box>
        </td>
      )}
      <td className="px-4 py-4 text-sm text-foreground border-r border-border print:border-black align-top whitespace-nowrap print:py-2">
        {publicStatus === 'date_undecided' ? (
          <Badge variant="outline" className="text-xs font-bold border-dashed">
            日時未定
          </Badge>
        ) : (
          <Box className={isCanceled ? 'opacity-50' : ''}>
            <Text weight="bold" className="text-base">
              {eventDate.getDate()}日 <span className="text-xs font-normal text-muted-foreground">({dayName})</span>
            </Text>
            {event.scheduled_end_date && (
              <Text className="text-xs text-muted-foreground block font-medium">
                〜 {new Date(event.scheduled_end_date).getDate()}日
              </Text>
            )}
            {timeString && (
              <Box className="flex items-center gap-1 mt-1 text-xs text-muted-foreground font-medium">
                <span className="opacity-60">🕒</span> {timeString} ~
              </Box>
            )}
          </Box>
        )}
      </td>
      <td className="px-4 py-4 text-sm text-foreground border-r border-border print:border-black align-top print:py-2">
        <Stack className="gap-2">
          <HStack className="items-center gap-2 flex-wrap">
            {publicStatus === 'draft' && (
              <Badge variant="secondary" className="bg-muted text-muted-foreground print:hidden text-[10px] px-1.5 py-0">
                下書き
              </Badge>
            )}
            {isCanceled ? (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                中止
              </Badge>
            ) : publicStatus === 'details_undecided' ? (
              <Badge variant="warning" className="text-[10px] px-1.5 py-0">
                詳細未定
              </Badge>
            ) : null}
            <Text weight="bold" className={`${textDecoration} ${isCanceled ? 'text-muted-foreground' : 'text-foreground'} text-base leading-tight`}>
              {event.title}
            </Text>
            {publicStatus === 'date_undecided' && !isCanceled && (
              <Text className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border mt-0.5">(予定)</Text>
            )}
          </HStack>
          {event.description && (
            <Box className={`text-xs text-muted-foreground prose prose-sm max-w-none print:text-black leading-relaxed ${isCanceled ? 'line-through opacity-50' : ''}`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{event.description}</ReactMarkdown>
            </Box>
          )}
        </Stack>
      </td>
      <td className={`px-4 py-4 text-sm text-muted-foreground border-r border-border print:border-black align-top ${textDecoration} print:py-2`}>
        <HStack className="items-center gap-1">
          {event.location && <span className="opacity-60 text-xs">📍</span>}
          <Text className="text-sm">{event.location || '-'}</Text>
        </HStack>
      </td>
      <td className="px-4 py-4 text-sm text-muted-foreground border-r border-border print:border-black align-top print:py-2">
        <Text className="text-sm">{event.organizer}</Text>
      </td>
      <td className={`px-4 py-3 text-right ${readOnly ? 'hidden' : 'print:hidden'} align-top`}>
        <HStack className="justify-end gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="h-8 w-8 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50"
            title="Googleカレンダーに追加"
          >
            <a href={googleCalUrl} target="_blank" rel="noopener noreferrer">
              <CalendarIcon size={16} />
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5"
            title="編集"
          >
            <Edit2 size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title="削除"
          >
            <Trash2 size={16} />
          </Button>
        </HStack>
      </td>
    </tr>
  )
}

function EventForm({ event, year, month, onCancel, onComplete }: { event?: Event, year: number, month: number, onCancel: () => void, onComplete: () => void }) {
  const [isPending, startTransition] = useTransition()

  // Initial date default
  const initialDate = event
    ? event.scheduled_date
    : `${year}-${month.toString().padStart(2, '0')}-01`

  // Initial time default
  const initialTime = event?.start_time ? event.start_time.slice(0, 5) : ''

  const [startDate, setStartDate] = useState(initialDate)
  const [showEndDateInput, setShowEndDateInput] = useState(!!event?.scheduled_end_date)
  const [isCanceled, setIsCanceled] = useState(event?.is_canceled || false)

  const handleSubmit = async (formData: FormData) => {
    if (event?.id) formData.append('id', event.id)

    startTransition(async () => {
      await upsertEvent(formData)
      onComplete()
    })
  }

  return (
    <form action={handleSubmit}>
      <Stack className="gap-6">
        <Box className="grid grid-cols-1 sm:grid-cols-12 gap-6">
          <Box className="sm:col-span-8 space-y-2">
            <Label className="font-bold">イベント名 <Text className="text-destructive">*</Text></Label>
            <Input
              name="title"
              defaultValue={event?.title}
              placeholder="イベント名を入力してください"
              required
            />
          </Box>

          <Box className="sm:col-span-4 rounded-xl bg-destructive/5 p-4 border border-destructive/20 flex items-center">
            <label className="flex items-center gap-3 text-sm text-destructive font-bold cursor-pointer w-full">
              <input
                type="checkbox"
                name="is_canceled"
                value="true"
                checked={isCanceled}
                onChange={e => setIsCanceled(e.target.checked)}
                className="w-4 h-4 rounded border-destructive/30 text-destructive focus:ring-destructive"
              />
              <AlertTriangle size={18} />
              中止にする
            </label>
          </Box>

          <Box className="sm:col-span-12 space-y-2">
            <Label className="font-bold">主催</Label>
            <HStack className="gap-6 flex-wrap bg-muted/30 p-3 rounded-lg border border-border">
              {['単位子ども会', '町子供会育成連合会', 'その他'].map(org => (
                <label key={org} className="flex items-center gap-2 text-sm text-foreground cursor-pointer group hover:text-primary transition-colors">
                  <input
                    type="radio"
                    name="organizer"
                    value={org}
                    defaultChecked={(event?.organizer || '単位子ども会') === org}
                    className="w-4 h-4 text-primary focus:ring-primary border-border"
                  />
                  <Text weight="medium">{org}</Text>
                </label>
              ))}
            </HStack>
          </Box>

          <Box className="sm:col-span-6 space-y-3">
            <Box className="space-y-2">
              <Label className="font-bold">日付 <Text className="text-destructive">*</Text></Label>
              <Input
                type="date"
                name="scheduled_date"
                defaultValue={initialDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </Box>
            <Box>
              {!showEndDateInput ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEndDateInput(true)}
                  className="text-xs h-8 px-3 text-primary hover:text-primary hover:bg-primary/5 border border-dashed border-primary/30 flex items-center gap-2 rounded-lg"
                >
                  <Plus size={14} /> 終了日(期間)を追加
                </Button>
              ) : (
                <HStack className="items-center gap-3 bg-primary/5 p-3 rounded-xl border border-dashed border-primary/20">
                  <Text className="text-xs font-bold text-primary shrink-0">終了日:</Text>
                  <Input
                    type="date"
                    name="scheduled_end_date"
                    defaultValue={event?.scheduled_end_date || startDate}
                    className="flex-1 h-9 text-sm"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowEndDateInput(false)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <X size={16} />
                  </Button>
                </HStack>
              )}
            </Box>
          </Box>

          <Box className="sm:col-span-6 space-y-4">
            <Box className="space-y-2">
              <Label className="font-bold">開始時間 <Text className="text-muted-foreground font-normal">(任意)</Text></Label>
              <Input
                type="time"
                name="start_time"
                defaultValue={initialTime}
              />
            </Box>
            <Box className="space-y-2">
              <Label className="font-bold">公開ステータス</Label>
              <Stack className="gap-2 bg-muted/30 p-3 rounded-lg border border-border">
                {[
                  { value: 'draft', label: '告知前（下書き/役員のみ）' },
                  { value: 'date_undecided', label: '告知・日時未定' },
                  { value: 'details_undecided', label: '告知・日時決定・詳細未定' },
                  { value: 'finalized', label: '告知・詳細決定' },
                ].map(status => (
                  <label key={status.value} className="flex items-center gap-3 text-sm text-foreground cursor-pointer group hover:text-primary transition-colors">
                    <input
                      type="radio"
                      name="public_status"
                      value={status.value}
                      defaultChecked={event?.public_status ? event.public_status === status.value : (status.value === 'finalized')}
                      className="w-4 h-4 text-primary focus:ring-primary border-border"
                    />
                    <Text weight="medium">{status.label}</Text>
                  </label>
                ))}
              </Stack>
            </Box>
          </Box>

          <Box className="sm:col-span-12 space-y-2">
            <Label className="font-bold">場所</Label>
            <Input
              name="location"
              defaultValue={event?.location || ''}
              placeholder="公民館、小学校など"
            />
          </Box>

          <Box className="sm:col-span-12 space-y-2">
            <Label className="font-bold">詳細・備考 <Text className="text-muted-foreground font-normal">(Markdown形式)</Text></Label>
            <MarkdownEditor
              name="description"
              defaultValue={event?.description || ''}
              placeholder="持ち物、注意事項など"
              rows={5}
            />
          </Box>
        </Box>

        <HStack className="justify-end gap-3 pt-6 border-t border-border">
          <Button type="button" variant="ghost" onClick={onCancel} className="font-bold">
            キャンセル
          </Button>
          <Button type="submit" disabled={isPending} activeScale={true} className="gap-2 px-8 h-10 font-bold shadow-md">
            <Save size={18} />
            {event ? '変更を保存' : '追加する'}
          </Button>
        </HStack>
      </Stack>
    </form>
  )
}

function generateEventIcs(events: Event[]) {
  let content = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Kodomokai//AnnualEvents//EN\n'
  events.forEach(event => {
    if (event.is_canceled) return // Skip canceled events? Or include as cancelled? Usually skip or STATUS:CANCELLED
    // Implementation: STATUS:CANCELLED exists in ICS.

    // ... (logic from before) ...
    // Reuse previous logic but add STATUS properties
    const dateStr = event.scheduled_date.replace(/-/g, '')
    const timeStr = event.start_time ? event.start_time.replace(/:/g, '').slice(0, 4) + '00' : '100000'
    const start = `${dateStr}T${timeStr}`

    let end = ''
    if (event.scheduled_end_date) {
      const dEnd = new Date(`${event.scheduled_end_date}T${event.start_time || '12:00:00'}`)
      if (!event.start_time) {
        dEnd.setHours(17)
      } else {
        dEnd.setHours(dEnd.getHours() + 2)
      }
      const pad = (n: number) => n.toString().padStart(2, '0')
      const endDateStr = `${dEnd.getFullYear()}${pad(dEnd.getMonth() + 1)}${pad(dEnd.getDate())}`
      const endTimeStr = `${pad(dEnd.getHours())}${pad(dEnd.getMinutes())}00`
      end = `${endDateStr}T${endTimeStr}`
    } else {
      const d = new Date(`${event.scheduled_date}T${event.start_time || '10:00:00'}`)
      d.setHours(d.getHours() + 2)
      const pad = (n: number) => n.toString().padStart(2, '0')
      const endDateStr = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
      const endTimeStr = `${pad(d.getHours())}${pad(d.getMinutes())}00`
      end = `${endDateStr}T${endTimeStr}`
    }

    content += 'BEGIN:VEVENT\n'
    content += `SUMMARY:${event.title}\n`
    content += `DTSTART:${start}\n`
    content += `DTEND:${end}\n`
    if (event.description) content += `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}\n`
    if (event.location) content += `LOCATION:${event.location}\n`
    // Status
    if (event.is_canceled) content += `STATUS:CANCELLED\n`
    else if (event.is_tentative) content += `STATUS:TENTATIVE\n`
    else content += `STATUS:CONFIRMED\n`

    content += 'END:VEVENT\n'
  })
  content += 'END:VCALENDAR'
  return content
}

function getGoogleCalendarUrl(event: Event) {
  const title = encodeURIComponent(event.title)
  const details = encodeURIComponent(event.description || '')
  const location = encodeURIComponent(event.location || '')

  // Dates
  const d = new Date(event.scheduled_date)
  const dStr = d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z' // UTC

  // Google Calendar Link Format needs Dates in UTC or specified timezone.
  // Simplest is YYYYMMDD/YYYYMMDD for all day, or YYYYMMDDThhmmss/YYYYMMDDThhmmss for specific time

  // Let's construct manually to avoid timezone confusion (treat input as local)
  const pad = (n: number) => n.toString().padStart(2, '0')
  const YMD = (date: Date) => `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`

  let start = YMD(new Date(event.scheduled_date))
  let end = start

  if (event.scheduled_end_date) {
    end = YMD(new Date(event.scheduled_end_date))
    // GCal end date is exclusive for all day events.
    // If it's all day, we need to add 1 day to end.
    if (!event.start_time) {
      const nextDay = new Date(event.scheduled_end_date)
      nextDay.setDate(nextDay.getDate() + 1)
      end = YMD(nextDay)
    }
  } else if (!event.start_time) {
    // Single day all day -> End is next day
    const nextDay = new Date(event.scheduled_date)
    nextDay.setDate(nextDay.getDate() + 1)
    end = YMD(nextDay)
  }

  // If time exists
  if (event.start_time) {
    const t = event.start_time.replace(/:/g, '') + '00' // HHMMSS
    start += `T${t}`
    // End time? Assume +2 hours if not specified
    // Since we don't have end_time in DB, we guess.
    // If we had end date but no end time, we assume end of day? No, usually events have duration.
    // Let's just add 2 hours to start time for end check
    // But wait, if end date is different...

    // Simplified:
    // If start time is present, use it.
    // End time: +2h
    const [h, m] = event.start_time.split(':').map(Number)
    const endDateObj = event.scheduled_end_date ? new Date(event.scheduled_end_date) : new Date(event.scheduled_date)
    endDateObj.setHours(h + 2, m)

    end = YMD(endDateObj) + `T${pad(endDateObj.getHours())}${pad(endDateObj.getMinutes())}00`
  }

  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`
}
