import { getRegularMeetings } from '@/app/actions/meetings'
import { MeetingListScreen } from '@/components/screens/admin/meetings/MeetingListScreen'

export default async function RegularMeetingsPage({
  searchParams,
}: {
  searchParams: { year?: string }
}) {
  const params = await searchParams
  const today = new Date()
  const currentFiscalYear = today.getMonth() < 3 ? today.getFullYear() - 1 : today.getFullYear()
  const year = params.year ? parseInt(params.year) : currentFiscalYear

  const meetings = await getRegularMeetings(year)

  const months = []
  for (let i = 0; i < 12; i++) {
    const monthVal = ((3 + i) % 12) + 1
    months.push(monthVal)
  }

  return <MeetingListScreen year={year} meetings={meetings} months={months} />
}
