import AnnualScheduleEditor from '@/components/admin/AnnualScheduleEditor'
import { toWarekiYear } from '@/lib/date-utils'
import { AdminPage } from '@/components/admin/patterns/AdminPage'

interface AnnualScheduleScreenProps {
  year: number
  events: any[]
  eraName: string
  startYear: number
}

export function AnnualScheduleScreen({
  year,
  events,
  eraName,
  startYear
}: AnnualScheduleScreenProps) {
  return (
    <AdminPage.Root className="print:p-0 print:max-w-3xl">
      <AdminPage.Header
        title="年間活動予定 編集"
        description={`${toWarekiYear(year, eraName, startYear)}度のイベントスケジュールを管理します。`}
        className="print:hidden"
      />

      <AdminPage.Content>
        <AnnualScheduleEditor year={year} events={events} eraName={eraName} startYear={startYear} />
      </AdminPage.Content>
    </AdminPage.Root>
  )
}
