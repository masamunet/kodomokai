'use client'

import { useState, useTransition } from 'react'
import { upsertEvent, deleteEvent } from '@/app/actions/events'
import { Calendar, Trash2, Edit2, CheckCircle2, HelpCircle, Save, X, Printer, Download } from 'lucide-react'
import MarkdownEditor from '@/components/ui/MarkdownEditor'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Extended Event type to include is_tentative (needs to match DB)
type Event = {
  id: string
  title: string
  description: string | null
  scheduled_date: string // Date string YYYY-MM-DD
  scheduled_end_date: string | null // Date string YYYY-MM-DD or null
  start_time: string | null // Time string HH:MM:SS or null
  location: string | null
  is_tentative: boolean
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <h2 className="text-xl font-bold">{year}年度 年間活動予定</h2>
        <div className="flex gap-2">
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

      <div className="print:block hidden mb-4 text-right text-sm text-gray-500">
        作成日: {new Date().toLocaleDateString('ja-JP')}
      </div>

      <div className="grid grid-cols-1 gap-6 print:gap-4">
        {MONTHS.map(month => {
          const monthEvents = getEventsForMonth(month)
          const displayYear = month >= 4 ? year : year + 1

          return (
            <div key={month} className="bg-white border border-gray-200 rounded-lg p-4 print:border-gray-900 print:break-inside-avoid">
              <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-2">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span className="text-2xl w-10 text-center text-indigo-600 print:text-black">{month}</span>
                  <span className="text-sm font-normal text-gray-500">{displayYear}年</span>
                </h3>
                <button
                  onClick={() => {
                    setIsAddingMonth(month)
                    setEditingEventId(null)
                  }}
                  className="print:hidden text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-100"
                >
                  + 追加
                </button>
              </div>

              <div className="space-y-3">
                {monthEvents.map(event => (
                  <EventItem
                    key={event.id}
                    event={event}
                    isEditing={editingEventId === event.id}
                    onEdit={() => setEditingEventId(event.id)}
                    onCancel={() => setEditingEventId(null)}
                  />
                ))}

                {isAddingMonth === month && (
                  <EventForm
                    year={displayYear}
                    month={month}
                    onCancel={() => setIsAddingMonth(null)}
                    onComplete={() => setIsAddingMonth(null)}
                  />
                )}

                {monthEvents.length === 0 && !isAddingMonth && (
                  <div className="text-sm text-gray-400 text-center py-2 print:hidden italic">
                    予定なし
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function EventItem({ event, isEditing, onEdit, onCancel }: { event: Event, isEditing: boolean, onEdit: () => void, onCancel: () => void }) {
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
      <div className="bg-gray-50 p-3 rounded border border-indigo-200">
        <EventForm
          event={event}
          year={new Date(event.scheduled_date).getFullYear()}
          month={new Date(event.scheduled_date).getMonth() + 1}
          onCancel={onCancel}
          onComplete={onCancel}
        />
      </div>
    )
  }

  const eventDate = new Date(event.scheduled_date)
  const timeString = event.start_time ? event.start_time.slice(0, 5) : null

  return (
    <div className={`group flex items-start gap-3 p-2 rounded hover:bg-gray-50 transition-colors ${event.is_tentative ? 'opacity-80' : ''}`}>
      <div className={`mt-1 flex-shrink-0 w-16 text-center text-sm font-bold ${event.is_tentative ? 'text-gray-400' : 'text-gray-900'}`}>
        {event.is_tentative ? (
          <span className="text-xs border border-gray-300 rounded px-1">未定</span>
        ) : (
          <div className="flex flex-col items-center leading-tight">
            <span>{eventDate.getDate()}日({['日', '月', '火', '水', '木', '金', '土'][eventDate.getDay()]})</span>
            {event.scheduled_end_date && (
              <span className="text-xs text-gray-500">〜 {new Date(event.scheduled_end_date).getDate()}日</span>
            )}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 text-base">{event.title}</span>
          {event.is_tentative && <HelpCircle size={14} className="text-gray-400" />}
        </div>
        <div className="text-sm text-gray-600 mt-0.5 flex gap-3 flex-wrap">
          {timeString && <span>{timeString}</span>}
          {event.location && <span>@ {event.location}</span>}
          {event.organizer && event.organizer !== '単位子ども会' && (
            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded-full">{event.organizer}</span>
          )}
        </div>
        {event.description && (
          <div className="text-sm text-gray-500 mt-1 prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{event.description}</ReactMarkdown>
          </div>
        )}
      </div>

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
        <button onClick={onEdit} className="p-1 text-gray-400 hover:text-indigo-600">
          <Edit2 size={16} />
        </button>
        <button onClick={handleDelete} className="p-1 text-gray-400 hover:text-red-600">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
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

  const handleSubmit = async (formData: FormData) => {
    if (event?.id) formData.append('id', event.id)

    startTransition(async () => {
      await upsertEvent(formData)
      onComplete()
    })
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="col-span-2">
          <input
            name="title"
            defaultValue={event?.title}
            placeholder="イベント名"
            required
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs text-gray-500 mb-1">主催</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-1 text-sm text-gray-700">
              <input type="radio" name="organizer" value="単位子ども会" defaultChecked={event?.organizer === '単位子ども会' || !event?.organizer} className="text-indigo-600 focus:ring-indigo-500" />
              単位子ども会
            </label>
            <label className="flex items-center gap-1 text-sm text-gray-700">
              <input type="radio" name="organizer" value="町子供会育成連合会" defaultChecked={event?.organizer === '町子供会育成連合会'} className="text-indigo-600 focus:ring-indigo-500" />
              町子供会育成連合会
            </label>
            <label className="flex items-center gap-1 text-sm text-gray-700">
              <input type="radio" name="organizer" value="その他" defaultChecked={event?.organizer === 'その他'} className="text-indigo-600 focus:ring-indigo-500" />
              その他
            </label>
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">日付</label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              name="scheduled_date"
              defaultValue={initialDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
            {!showEndDateInput ? (
              <button
                type="button"
                onClick={() => setShowEndDateInput(true)}
                className="text-sm text-indigo-600 hover:text-indigo-800 underline flex-shrink-0"
              >
                + 終了日を追加
              </button>
            ) : (
              <>
                <span className="text-gray-400">〜</span>
                <div className="flex-1 flex items-center gap-1">
                  <input
                    type="date"
                    name="scheduled_end_date"
                    defaultValue={event?.scheduled_end_date || startDate} // Use current startDate state as default
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEndDateInput(false)}
                    className="text-gray-400 hover:text-gray-600"
                    title="終了日を削除"
                  >
                    <X size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">※終了日を設定すると期間表示になります</p>
          {/* If hidden, ensure we don't submit a value or submit null? 
              The form uses FormData. If input is not rendered, it won't be sent? 
              Wait, if we toggle OFF, the input is gone. So scheduled_end_date is missing.
              Action needs to handle missing = null. 
              Our acton: const scheduled_end_date = formData.get('scheduled_end_date') as string | null
              If missing, get() returns null. Correct.
           */}
        </div>
        <div>
          {/* Re-introduced Time Input, but optional */}
          <label className="block text-xs text-gray-500 mb-1">時間 (未定の場合は空欄)</label>
          <input
            type="time"
            name="start_time"
            defaultValue={initialTime}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div className="col-span-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="is_tentative"
              value="true"
              defaultChecked={event?.is_tentative}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            日付は未定（仮）
          </label>
        </div>
        <div className="col-span-2">
          <input
            name="location"
            defaultValue={event?.location || ''}
            placeholder="場所"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div className="col-span-2">
          <MarkdownEditor
            name="description"
            defaultValue={event?.description || ''}
            placeholder="備考・詳細 (Markdown対応)"
            rows={4}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 rounded">
          キャンセル
        </button>
        <button type="submit" disabled={isPending} className="px-3 py-1.5 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-sm disabled:opacity-50 flex items-center gap-1">
          <Save size={14} /> 保存
        </button>
      </div>
    </form>
  )
}

function generateEventIcs(events: Event[]) {
  let content = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Kodomokai//AnnualEvents//EN\n'
  events.forEach(event => {
    // Handle optional time
    const dateStr = event.scheduled_date.replace(/-/g, '')
    const timeStr = event.start_time ? event.start_time.replace(/:/g, '').slice(0, 4) + '00' : '100000'
    const start = `${dateStr}T${timeStr}`

    let end = ''
    if (event.scheduled_end_date) {
      // Multi-day event
      // If time is not set, we treat end date as inclusive all day -> DTEND is next day? 
      // Or if time is set, it ends at same time on end date?
      // User said "Start date only usually", implies Time is for start.
      // Let's assume end date is inclusive.
      // For ICS, DTEND is exclusive. So we add 1 day to end date if it's "All Day" logic, 
      // but here we are mixing Time and Date.
      // If Time is NULL (default 10:00 used above? No, we used dummy '100000').
      // Let's treat multi-day with NO time as All Day Event?
      // Current logic forces T100000.

      // Let's stick to: End Date T Same Time + 2 hours (or just end of day?)
      // Let's set End Date T 12:00:00 for simplicity if time was 10:00
      const dEnd = new Date(`${event.scheduled_end_date}T${event.start_time || '12:00:00'}`)
      if (!event.start_time) {
        // If no start time, maybe 17:00 end?
        dEnd.setHours(17)
      } else {
        dEnd.setHours(dEnd.getHours() + 2) // +2h duration
      }

      const pad = (n: number) => n.toString().padStart(2, '0')
      const endDateStr = `${dEnd.getFullYear()}${pad(dEnd.getMonth() + 1)}${pad(dEnd.getDate())}`
      const endTimeStr = `${pad(dEnd.getHours())}${pad(dEnd.getMinutes())}00`
      end = `${endDateStr}T${endTimeStr}`
    } else {
      // Single day
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
    if (event.is_tentative) content += `STATUS:TENTATIVE\n`
    content += 'END:VEVENT\n'
  })
  content += 'END:VCALENDAR'
  return content
}
