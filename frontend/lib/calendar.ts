type Meeting = {
  id: string
  target_year: number
  target_month: number
  scheduled_date: string | null
  start_time: string | null
  location: string | null
  description: string | null
}

const formatDateTime = (dateStr: string, timeStr: string) => {
  const date = new Date(dateStr)
  const [hours, minutes] = timeStr.split(':')
  date.setHours(parseInt(hours, 10))
  date.setMinutes(parseInt(minutes, 10))

  // Format to YYYYMMDDTHHMMSS
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`
}

export const generateGoogleCalendarUrl = (meeting: Meeting) => {
  if (!meeting.scheduled_date) return ''

  const startTime = meeting.start_time || '10:00' // Default to 10 AM if not set
  const startDateTime = formatDateTime(meeting.scheduled_date, startTime)

  // Assume 2 hours duration by default
  const endDate = new Date(meeting.scheduled_date)
  const [hours, minutes] = startTime.split(':')
  endDate.setHours(parseInt(hours, 10) + 2)
  endDate.setMinutes(parseInt(minutes, 10))
  const pad = (n: number) => n.toString().padStart(2, '0')
  const endDateTime = `${endDate.getFullYear()}${pad(endDate.getMonth() + 1)}${pad(endDate.getDate())}T${pad(endDate.getHours())}${pad(endDate.getMinutes())}00`

  const text = encodeURIComponent(`${meeting.target_month}月 定例会`)
  const details = encodeURIComponent(meeting.description || '')
  const location = encodeURIComponent(meeting.location || '')

  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${startDateTime}/${endDateTime}&details=${details}&location=${location}`
}

export const generateIcsContent = (meetings: Meeting[]) => {
  let content = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Kodomokai//Admin//EN\n'

  meetings.forEach(meeting => {
    if (!meeting.scheduled_date) return

    // Add logic to skip meetings without date if needed, but here we just filter in UI
    const startTime = meeting.start_time || '10:00'
    const startDateTime = formatDateTime(meeting.scheduled_date, startTime)

    const endDate = new Date(meeting.scheduled_date)
    const [hours, minutes] = startTime.split(':')
    endDate.setHours(parseInt(hours, 10) + 2)
    endDate.setMinutes(parseInt(minutes, 10))
    const pad = (n: number) => n.toString().padStart(2, '0')
    const endDateTime = `${endDate.getFullYear()}${pad(endDate.getMonth() + 1)}${pad(endDate.getDate())}T${pad(endDate.getHours())}${pad(endDate.getMinutes())}00`

    content += 'BEGIN:VEVENT\n'
    content += `SUMMARY:${meeting.target_month}月 定例会\n`
    content += `DTSTART:${startDateTime}\n`
    content += `DTEND:${endDateTime}\n`
    if (meeting.description) content += `DESCRIPTION:${meeting.description}\n`
    if (meeting.location) content += `LOCATION:${meeting.location}\n`
    content += 'END:VEVENT\n'
  })

  content += 'END:VCALENDAR'
  return content
}
