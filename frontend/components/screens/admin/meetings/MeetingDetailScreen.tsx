import MeetingEditor from '@/components/admin/MeetingEditor'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Box } from '@/ui/layout/Box'
import { Heading } from '@/ui/primitives/Heading'
import { Text } from '@/ui/primitives/Text'

interface MeetingDetailScreenProps {
  meeting: any
}

export function MeetingDetailScreen({ meeting }: MeetingDetailScreenProps) {
  return (
    <Box className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Link
          href={`/admin/meetings?year=${meeting.target_year}`}
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft size={16} />
          <Text>定例会一覧({meeting.target_year}年度)に戻る</Text>
        </Link>
        <Heading size="h1" className="text-2xl font-bold text-foreground">
          {meeting.target_year}年{meeting.target_month}月 定例会 詳細
        </Heading>
      </div>

      <MeetingEditor
        year={meeting.target_year}
        month={meeting.target_month}
        meeting={meeting}
        agendas={meeting.meeting_agendas || []}
        defaultItemsExpanded={true}
      />
    </Box>
  )
}
