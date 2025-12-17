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
  start_time: string | null // Time string HH:MM:SS or null
  location: string | null
  is_tentative: boolean
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
          <span>{eventDate.getDate()}日({['日', '月', '火', '水', '木', '金', '土'][eventDate.getDay()]})</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 text-base">{event.title}</span>
          {event.is_tentative && <HelpCircle size={14} className="text-gray-400" />}
        </div>
        <div className="text-sm text-gray-600 mt-0.5 flex gap-3">
          {timeString && <span>{timeString}</span>}
          {event.location && <span>@ {event.location}</span>}
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
        <div>
          <label className="block text-xs text-gray-500 mb-1">日付</label>
          <input
            type="date"
            name="scheduled_date"
            defaultValue={initialDate}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
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

    // End time? Assume 2 hours later
    // Need Date object handling
    const d = new Date(`${event.scheduled_date}T${event.start_time || '10:00:00'}`)
    d.setHours(d.getHours() + 2)

    const pad = (n: number) => n.toString().padStart(2, '0')
    const endDateStr = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
    const endTimeStr = `${pad(d.getHours())}${pad(d.getMinutes())}00`
    const end = `${endDateStr}T${endTimeStr}`

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
