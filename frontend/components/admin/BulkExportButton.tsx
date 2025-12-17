'use client'

import { generateIcsContent } from '@/lib/calendar'
import { Download } from 'lucide-react'

type Meeting = {
  id: string
  target_year: number
  target_month: number
  scheduled_date: string | null
  start_time: string | null
  location: string | null
  description: string | null
}

export default function BulkExportButton({ meetings }: { meetings: Meeting[] }) {
  const handleDownload = () => {
    const validMeetings = meetings.filter(m => m.scheduled_date)
    if (validMeetings.length === 0) {
      alert('日程が決まっている定例会がありません。')
      return
    }

    const content = generateIcsContent(validMeetings)
    const blob = new Blob([content], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `regular_meetings_${meetings[0].target_year}.ics`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 text-sm font-medium shadow-sm transition-colors"
    >
      <Download size={16} />
      カレンダー一括登録 (ICS)
    </button>
  )
}
