'use client'

import { CalendarPlus } from 'lucide-react'
import { useCallback } from 'react'

type Props = {
  title: string
  description?: string
  date: string // YYYY-MM-DD
  startTime?: string | null // HH:mm:ss or HH:mm
  location?: string | null
  associationName?: string
}

export default function GoogleCalendarButton({
  title,
  description,
  date,
  startTime,
  location,
  associationName,
}: Props) {
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      // Format title
      const eventTitle = associationName ? `${title} (${associationName})` : title

      // Format dates
      let dates = ''
      const cleanDate = date.replace(/-/g, '')

      if (startTime) {
        // Has start time. Assume 2 hour duration if end time not specified (simplified for now)
        // or just start time. Google calendar link handles duration if provided, but we only have start time in many cases.
        // Let's set it for 2 hours by default? Or just open the event creation with start time.
        // Google Calendar link `dates` format: YYYYMMDDThhmmss/YYYYMMDDThhmmss

        const cleanTime = startTime.replace(/:/g, '').slice(0, 4) + '00' // HHmmss
        const startDate = `${cleanDate}T${cleanTime}`

        // Let's assume 2 hours duration by default for convenience
        const startHour = parseInt(startTime.split(':')[0], 10)
        const endHour = startHour + 2
        const endHourStr = endHour.toString().padStart(2, '0')
        // precise end time calculation not critical, user can adjust
        const endDate = `${cleanDate}T${endHourStr}${startTime.split(':')[1] || '00'}00`

        dates = `${startDate}/${endDate}`
      } else {
        // All day event: YYYYMMDD/YYYYMMDD+1
        const nextDate = new Date(date)
        nextDate.setDate(nextDate.getDate() + 1)
        const nextDateStr = nextDate.toISOString().split('T')[0].replace(/-/g, '')
        dates = `${cleanDate}/${nextDateStr}`
      }

      const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: eventTitle,
        details: description || '',
        location: location || '',
        dates: dates,
      })

      window.open(`https://www.google.com/calendar/render?${params.toString()}`, '_blank')
    },
    [title, description, date, startTime, location, associationName]
  )

  return (
    <button
      type="button"
      onClick={handleClick}
      className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      title="Googleカレンダーに追加"
      aria-label="Googleカレンダーに追加"
    >
      <CalendarPlus size={20} />
    </button>
  )
}
