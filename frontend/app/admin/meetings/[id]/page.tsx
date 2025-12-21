import { getRegularMeeting } from '@/app/actions/meetings'
import { notFound } from 'next/navigation'
import { MeetingDetailScreen } from '@/components/screens/admin/meetings/MeetingDetailScreen'

export default async function RegularMeetingDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const p = await params
  const meeting = await getRegularMeeting(p.id)

  if (!meeting) {
    notFound()
  }

  return <MeetingDetailScreen meeting={meeting} />
}
