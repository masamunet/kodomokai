import AnnualScheduleEditor from '@/components/admin/AnnualScheduleEditor'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { toWarekiYear } from '@/lib/date-utils'
import { Box } from '@/ui/layout/Box'
import { Stack } from '@/ui/layout/Stack'
import { Heading } from '@/ui/primitives/Heading'
import { Text } from '@/ui/primitives/Text'

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
    <Box className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 bg-white shadow rounded-lg print:shadow-none print:p-0 print:max-w-3xl print:mx-auto">
      <Box className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-2"
          >
            <ChevronLeft size={16} />
            <Text>ダッシュボードに戻る</Text>
          </Link>
          <Heading size="h1" className="text-2xl font-bold text-foreground">年間活動予定 編集</Heading>
          <Text className="text-sm text-gray-500">
            {toWarekiYear(year, eraName, startYear)}度のイベントスケジュールを管理します。
          </Text>
        </div>
        <Box className="flex items-center gap-2">
          {/* Year switcher could go here */}
        </Box>
      </Box>

      <AnnualScheduleEditor year={year} events={events} eraName={eraName} startYear={startYear} />
    </Box>
  )
}
