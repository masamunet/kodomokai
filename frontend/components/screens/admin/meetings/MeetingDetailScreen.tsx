import MeetingEditor from '@/components/admin/MeetingEditor'
import { AdminPage } from '@/components/admin/patterns/AdminPage'

interface MeetingDetailScreenProps {
  meeting: any
}

export function MeetingDetailScreen({ meeting }: MeetingDetailScreenProps) {
  return (
    <AdminPage.Root maxWidth="5xl">
      <AdminPage.Header
        title={`${meeting.target_month}月 定例会`}
        description={`${meeting.target_year}年度 ${meeting.target_month}月の定例会詳細・議題編集`}
      />

      <AdminPage.Content>
        <MeetingEditor
          year={meeting.target_year}
          month={meeting.target_month}
          meeting={meeting}
          agendas={meeting.meeting_agendas || []}
          defaultItemsExpanded={true}
        />
      </AdminPage.Content>
    </AdminPage.Root>
  )
}
