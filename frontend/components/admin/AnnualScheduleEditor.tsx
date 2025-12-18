'use client'

import { useState, useTransition, Fragment } from 'react'
import { upsertEvent, deleteEvent } from '@/app/actions/events'
import { Calendar, Trash2, Edit2, CheckCircle2, HelpCircle, Save, X, Printer, Download, Calendar as CalendarIcon, AlertTriangle } from 'lucide-react'
import MarkdownEditor from '@/components/ui/MarkdownEditor'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Extended Event type to include is_tentative and is_canceled
type Event = {
  id: string
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
}

const MONTHS = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3]

export default function AnnualScheduleEditor({ year, events }: Props) {
  const [isPending, startTransition] = useTransition()
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [isAddingMonth, setIsAddingMonth] = useState<number | null>(null)

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold print:text-lg">{year}年度 年間活動予定</h2>
          <p className="text-sm text-gray-500 mt-1 print:text-xs">
            最終発行: {printedDate}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleDownloadIcs}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 text-sm font-medium"
          >
            <Download size={16} /> ICSダウンロード
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded shadow-sm hover:bg-indigo-700 text-sm font-medium"
          >
            <Printer size={16} /> 印刷 / PDF保存
          </button>
        </div>
      </div>

      <div className="hidden print:block mb-4 text-right text-sm text-gray-500">
        <div>{year}年度 年間活動予定表</div>
        <div className="text-xs">発行日: {printedDate} (最新版をご確認ください)</div>
      </div>

      {/* Table Structure for Print and Desktop */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden print:border-2 print:border-black print:text-xs">
        <table className="min-w-full divide-y divide-gray-200 print:divide-black">
          <thead className="bg-gray-50 print:bg-gray-100">
            <tr>
              <th scope="col" className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-24 print:text-black border-r print:border-black print:py-1 print:w-16">月</th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-32 print:text-black border-r print:border-black print:py-1 print:w-20">日時</th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider print:text-black border-r print:border-black print:py-1">イベント名 / 詳細</th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-32 print:text-black border-r print:border-black print:py-1 print:w-20">場所</th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-24 print:text-black border-r print:border-black print:py-1 print:w-16">主催</th>
              <th scope="col" className="px-3 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-20 print:hidden">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 print:divide-black">
            {MONTHS.map(month => {
              const monthEvents = getEventsForMonth(month)
              const displayYear = month >= 4 ? year : year + 1

              if (monthEvents.length === 0 && isAddingMonth !== month) {
                return (
                  <tr key={month} className="group hover:bg-gray-50 print:break-inside-avoid print:h-4">
                    <td className="px-3 py-4 text-sm text-gray-900 border-r border-gray-100 print:border-black font-bold align-top bg-gray-50/50 print:bg-transparent print:py-1 print:text-xs">
                      <div className="flex items-center justify-between">
                        <span>{month}月</span>
                        <button
                          onClick={() => {
                            setIsAddingMonth(month)
                            setEditingEventId(null)
                          }}
                          className="print:hidden text-xs text-indigo-600 hover:bg-indigo-50 rounded px-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td colSpan={5} className="px-3 py-4 text-sm text-gray-400 italic text-center print:hidden">
                      予定なし
                    </td>
                    {/* For print, maybe we skip empty months or show them empty? Requirements imply "Schedule", implying list of events. But empty months are placeholders. Let's show empty cell for print too but minimal */}
                    <td colSpan={3} className="hidden print:table-cell px-3 py-4 text-sm text-gray-400 italic text-center text-xs print:py-1 print:text-[10px] print:h-4">
                      -
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

                      rowSpan={monthEvents.length + (isAddingMonth === month ? 1 : 0)}
                      isEditing={editingEventId === event.id}
                      onEdit={() => setEditingEventId(event.id)}
                      onCancel={() => setEditingEventId(null)}
                      onAdd={() => setIsAddingMonth(month)}
                      showMonthCell={index === 0}
                    />
                  ))}
                  {isAddingMonth === month && (
                    <tr className="bg-indigo-50 border-t-2 border-indigo-200 print:hidden">
                      {monthEvents.length === 0 && (
                        <td className="px-3 py-4 text-sm font-bold text-gray-900 border-r border-gray-200 bg-gray-50 align-top">
                          {month}月
                        </td>
                      )}
                      <td colSpan={5} className="p-4">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-200">
                          <h4 className="font-bold text-indigo-700 mb-3 flex items-center gap-2">
                            <CalendarIcon size={16} /> {displayYear}年{month}月 新規イベント追加
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
      </div>
    </div>
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
  onAdd
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
      <tr className="bg-indigo-50 print:hidden">
        {showMonthCell && (
          <td rowSpan={rowSpan} className="px-3 py-4 text-sm font-bold text-gray-900 border-r border-gray-200 align-top bg-gray-50">
            {month}月
          </td>
        )}
        <td colSpan={5} className="p-4">
          <div className="bg-white p-4 rounded border border-indigo-200 shadow-sm">
            <EventForm
              event={event}
              year={year}
              month={month}
              onCancel={onCancel}
              onComplete={onCancel}
            />
          </div>
        </td>
      </tr>
    )
  }

  const eventDate = new Date(event.scheduled_date)
  const timeString = event.start_time ? event.start_time.slice(0, 5) : null
  const dayName = ['日', '月', '火', '水', '木', '金', '土'][eventDate.getDay()]

  const isCanceled = event.is_canceled
  const isTentative = event.is_tentative

  const rowClass = isCanceled
    ? 'bg-gray-100 text-gray-500 print:bg-gray-200'
    : (isTentative ? 'bg-white' : 'bg-white')
  const textDecoration = isCanceled ? 'line-through' : ''

  const googleCalUrl = getGoogleCalendarUrl(event)

  return (
    <tr className={`${rowClass} hover:bg-gray-50 group print:break-inside-avoid`}>
      {showMonthCell && (
        <td rowSpan={rowSpan} className="px-3 py-4 text-sm font-bold text-gray-900 border-r border-gray-200 print:border-black align-top bg-gray-50/50 print:bg-transparent min-w-[3rem] print:py-1 print:text-xs">
          <div className="flex justify-between print:justify-center">
            <span className="text-xl print:text-sm">{month}</span>
            <span className="text-xs pt-1 print:hidden">月</span>
            <button
              onClick={onAdd}
              className="print:hidden text-xs text-indigo-600 hover:bg-indigo-50 rounded px-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1"
              title="この月に追加"
            >
              +
            </button>
          </div>
        </td>
      )}
      <td className="px-3 py-3 text-sm text-gray-900 border-r border-gray-100 print:border-black align-top whitespace-nowrap print:py-1 print:text-xs">
        {isTentative ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300 print:border-0 print:p-0">
            日付未定
          </span>
        ) : (
          <div className={isCanceled ? 'opacity-50' : ''}>
            <div className="font-bold">
              {eventDate.getDate()}日 <span className="text-xs font-normal text-gray-500 print:hidden">({dayName})</span><span className="hidden print:inline text-[10px]">({dayName})</span>
            </div>
            {event.scheduled_end_date && (
              <div className="text-xs text-gray-500 print:text-[10px]">
                〜 {new Date(event.scheduled_end_date).getDate()}日
              </div>
            )}
            {timeString && (
              <div className="text-xs text-gray-600 mt-1 print:text-[10px] print:mt-0">
                {timeString} ~
              </div>
            )}
          </div>
        )}
      </td>
      <td className="px-3 py-3 text-sm text-gray-900 border-r border-gray-100 print:border-black align-top print:py-1 print:text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {isCanceled && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800 border border-red-200 print:bg-transparent print:text-gray-500 print:border-black print:text-[10px] print:p-0 print:px-1">
              中止
            </span>
          )}
          <span className={`font-bold ${textDecoration} ${isCanceled ? 'text-gray-400' : 'text-gray-900'}`}>
            {event.title}
          </span>
          {isTentative && !isCanceled && (
            <span className="text-xs text-gray-400 border border-gray-200 rounded px-1 print:border-0 print:text-gray-500">(予定)</span>
          )}
        </div>
        {event.description && (
          <div className={`mt-1 text-xs text-gray-600 prose prose-sm max-w-none print:text-black print:text-[10px] print:leading-tight print:mt-0 ${isCanceled ? 'line-through opacity-50' : ''}`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{event.description}</ReactMarkdown>
          </div>
        )}
      </td>
      <td className={`px-3 py-3 text-sm text-gray-600 border-r border-gray-100 print:border-black align-top ${textDecoration} print:py-1 print:text-xs`}>
        {event.location || '-'}
      </td>
      <td className="px-3 py-3 text-sm text-gray-600 border-r border-gray-100 print:border-black align-top print:py-1 print:text-xs print:w-16">
        {event.organizer}
      </td>
      <td className="px-3 py-3 text-sm text-right print:hidden align-top">
        <div className="flex justify-end gap-1 opacity-10 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <a
            href={googleCalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
            title="Googleカレンダーに追加"
          >
            <CalendarIcon size={16} />
          </a>
          <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="編集">
            <Edit2 size={16} />
          </button>
          <button onClick={handleDelete} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="削除">
            <Trash2 size={16} />
          </button>
        </div>
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
    <form action={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
        <div className="sm:col-span-8">
          <label className="block text-xs font-bold text-gray-700 mb-1">イベント名 <span className="text-red-500">*</span></label>
          <input
            name="title"
            defaultValue={event?.title}
            placeholder="イベント名"
            required
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="sm:col-span-4 rounded bg-red-50 p-2 border border-red-100 flex items-center">
          <label className="flex items-center gap-2 text-sm text-red-800 font-bold cursor-pointer w-full">
            <input
              type="checkbox"
              name="is_canceled"
              value="true"
              checked={isCanceled}
              onChange={e => setIsCanceled(e.target.checked)}
              className="rounded border-red-300 text-red-600 focus:ring-red-500"
            />
            <AlertTriangle size={16} />
            中止にする
          </label>
        </div>

        <div className="sm:col-span-12">
          <label className="block text-xs text-gray-500 mb-1">主催</label>
          <div className="flex gap-4 flex-wrap">
            {['単位子ども会', '町子供会育成連合会', 'その他'].map(org => (
              <label key={org} className="flex items-center gap-1 text-sm text-gray-700 cursor-pointer">
                <input type="radio" name="organizer" value={org} defaultChecked={(event?.organizer || '単位子ども会') === org} className="text-indigo-600 focus:ring-indigo-500" />
                {org}
              </label>
            ))}
          </div>
        </div>

        <div className="sm:col-span-6">
          <label className="block text-xs text-gray-500 mb-1">日付 <span className="text-red-500">*</span></label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              name="scheduled_date"
              defaultValue={initialDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div className="mt-1">
            {!showEndDateInput ? (
              <button
                type="button"
                onClick={() => setShowEndDateInput(true)}
                className="text-xs text-indigo-600 hover:text-indigo-800 underline flex items-center gap-1"
              >
                + 終了日(期間)を追加
              </button>
            ) : (
              <div className="flex items-center gap-2 mt-1 bg-gray-50 p-1.5 rounded border border-dashed border-gray-300">
                <span className="text-xs text-gray-500">終了日:</span>
                <input
                  type="date"
                  name="scheduled_end_date"
                  defaultValue={event?.scheduled_end_date || startDate}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs py-1"
                />
                <button
                  type="button"
                  onClick={() => setShowEndDateInput(false)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="sm:col-span-6">
          <label className="block text-xs text-gray-500 mb-1">開始時間 (任意)</label>
          <input
            type="time"
            name="start_time"
            defaultValue={initialTime}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <label className="flex items-center gap-2 text-sm text-gray-700 mt-2">
            <input
              type="checkbox"
              name="is_tentative"
              value="true"
              defaultChecked={event?.is_tentative}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs">日付は未定（仮・月のみ決定）</span>
          </label>
        </div>

        <div className="sm:col-span-12">
          <label className="block text-xs text-gray-500 mb-1">場所</label>
          <input
            name="location"
            defaultValue={event?.location || ''}
            placeholder="公民館、小学校など"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="sm:col-span-12">
          <label className="block text-xs text-gray-500 mb-1">詳細・備考 (Markdown)</label>
          <MarkdownEditor
            name="description"
            defaultValue={event?.description || ''}
            placeholder="持ち物、注意事項など"
            rows={4}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 bg-white border border-gray-300 rounded shadow-sm">
          キャンセル
        </button>
        <button type="submit" disabled={isPending} className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-sm disabled:opacity-50 flex items-center gap-2 font-bold">
          <Save size={16} />
          {event ? '変更を保存' : '追加する'}
        </button>
      </div>
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
