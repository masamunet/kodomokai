import { getRegularMeeting } from '@/app/actions/meetings'
import MeetingEditor from '@/components/admin/MeetingEditor'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { notFound } from 'next/navigation'

export default async function RegularMeetingDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const p = await params // async access
  const meeting = await getRegularMeeting(p.id)

  if (!meeting) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Link
          href={`/admin/meetings?year=${meeting.target_year}`}
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft size={16} />
          <span>定例会一覧({meeting.target_year}年度)に戻る</span>
        </Link>
        <h1 className="text-2xl font-bold text-foreground">
          {meeting.target_year}年{meeting.target_month}月 定例会 詳細
        </h1>
      </div>

      <MeetingEditor
        year={meeting.target_year}
        month={meeting.target_month}
        meeting={meeting}
        agendas={meeting.meeting_agendas || []}
        defaultItemsExpanded={true}
      />
    </div>
  )
}
