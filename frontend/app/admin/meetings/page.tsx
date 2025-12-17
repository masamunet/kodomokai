import { getRegularMeetings } from '@/app/actions/meetings'
import MeetingEditor from '@/components/admin/MeetingEditor'
import BulkExportButton from '@/components/admin/BulkExportButton'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default async function RegularMeetingsPage({
  searchParams,
}: {
  searchParams: { year?: string }
}) {
  const params = await searchParams // async access for Next.js 15
  const today = new Date()
  const currentFiscalYear = today.getMonth() < 3 ? today.getFullYear() - 1 : today.getFullYear()
  const year = params.year ? parseInt(params.year) : currentFiscalYear

  const meetings = await getRegularMeetings(year)

  // Generate 12 months for the fiscal year (Apr -> Mar)
  const months = []
  for (let i = 0; i < 12; i++) {
    const monthVal = ((3 + i) % 12) + 1 // 4, 5, ..., 12, 1, 2, 3
    months.push(monthVal)
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-foreground">役員定例会</h1>
        <div className="flex items-center gap-4">
          <BulkExportButton meetings={meetings} />

          <div className="flex items-center gap-2">
            <Link
              href={`/admin/meetings?year=${year - 1}`}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <ChevronLeft size={20} className="text-muted-foreground hover:text-foreground" />
            </Link>
            <span className="text-lg font-bold text-foreground">{year}年度</span>
            <Link
              href={`/admin/meetings?year=${year + 1}`}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <ChevronRight size={20} className="text-muted-foreground hover:text-foreground" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
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
      </div>
    </div>
  )
}
