import MeetingEditor from '@/components/admin/MeetingEditor'
import BulkExportButton from '@/components/admin/BulkExportButton'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Box } from '@/ui/layout/Box'
import { Stack } from '@/ui/layout/Stack'
import { Heading } from '@/ui/primitives/Heading'
import { Text } from '@/ui/primitives/Text'

interface MeetingListScreenProps {
  year: number
  meetings: any[]
  months: number[]
}

export function MeetingListScreen({ year, meetings, months }: MeetingListScreenProps) {
  return (
    <Box className="max-w-5xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <Heading size="h1" className="text-2xl font-bold text-foreground">役員定例会</Heading>
        <div className="flex items-center gap-4">
          <BulkExportButton meetings={meetings} />

          <div className="flex items-center gap-2">
            <Link
              href={`/admin/meetings?year=${year - 1}`}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <ChevronLeft size={20} className="text-muted-foreground hover:text-foreground" />
            </Link>
            <Text weight="bold" className="text-lg text-foreground">{year}年度</Text>
            <Link
              href={`/admin/meetings?year=${year + 1}`}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <ChevronRight size={20} className="text-muted-foreground hover:text-foreground" />
            </Link>
          </div>
        </div>
      </div>

      <Stack className="gap-6">
        {months.map(month => {
          const meeting = meetings.find((m: any) => m.target_month === month)
          return (
            <MeetingEditor
              key={month}
              year={year}
              month={month}
              meeting={meeting}
              agendas={meeting?.meeting_agendas || []}
            />
          )
        })}
      </Stack>
    </Box>
  )
}
