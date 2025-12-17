import { getAnnualEvents } from '@/app/actions/events'
import { getTargetFiscalYear } from '@/app/admin/actions/settings'
import AnnualScheduleEditor from '@/components/admin/AnnualScheduleEditor'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function AnnualEventsPage({
  searchParams,
}: {
  searchParams: { year?: string }
}) {
  // Determine target year: priority URL param > User Setting > Default
  // But this page is specifically "Annual Schedule Editor", so it should probably default to the "Target Fiscal Year"
  const sp = await searchParams
  const settingsYear = await getTargetFiscalYear()
  const year = sp.year ? parseInt(sp.year) : settingsYear

  const events = await getAnnualEvents(year)

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 bg-white shadow rounded-lg">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-2"
          >
            <ChevronLeft size={16} />
            <span>ダッシュボードに戻る</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">年間活動予定 編集</h1>
          <p className="text-sm text-gray-500">
            {year}年度のイベントスケジュールを管理します。
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Year switcher could go here if we want to jump years easily within this page */
             /* For now, FiscalYearSwitcher in header handles global context */}
        </div>
      </div>

      <AnnualScheduleEditor year={year} events={events || []} />
    </div>
  )
}
