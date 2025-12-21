import MeetingEditor from '@/components/admin/MeetingEditor'
import BulkExportButton from '@/components/admin/BulkExportButton'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Text } from '@/ui/primitives/Text'
import { AdminPage } from '@/components/admin/patterns/AdminPage'
import { Box } from '@/ui/layout/Box'
import { HStack } from '@/ui/layout/Stack'
import { Button } from '@/ui/primitives/Button'

interface MeetingListScreenProps {
  year: number
  meetings: any[]
  months: number[]
}

export function MeetingListScreen({ year, meetings, months }: MeetingListScreenProps) {
  return (
    <AdminPage.Root maxWidth="5xl">
      <AdminPage.Header
        title="役員定例会"
        description="年度ごとの定例会スケジュールと議題を管理します。"
      />

      <HStack className="justify-end items-center mb-6 gap-4">
        <BulkExportButton meetings={meetings} />

        <HStack className="items-center gap-2 bg-muted/30 p-1 rounded-lg border border-border">
          <Button
            variant="ghost"
            size="icon"
            activeScale={true}
            asChild
            className="h-8 w-8 hover:bg-background hover:shadow-sm rounded-md"
          >
            <Link
              href={`/admin/meetings?year=${year - 1}`}
              title="前年度"
            >
              <ChevronLeft size={18} className="text-muted-foreground" />
            </Link>
          </Button>
          <Text weight="bold" className="px-2 text-sm text-foreground">{year}年度</Text>
          <Button
            variant="ghost"
            size="icon"
            activeScale={true}
            asChild
            className="h-8 w-8 hover:bg-background hover:shadow-sm rounded-md"
          >
            <Link
              href={`/admin/meetings?year=${year + 1}`}
              title="次年度"
            >
              <ChevronRight size={18} className="text-muted-foreground" />
            </Link>
          </Button>
        </HStack>
      </HStack>

      <AdminPage.Content>
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
      </AdminPage.Content>
    </AdminPage.Root>
  )
}
