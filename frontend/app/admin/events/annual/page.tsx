import { getAnnualEvents } from '@/app/actions/events'
import { getTargetFiscalYear } from '@/app/admin/actions/settings'
import AnnualScheduleEditor from '@/components/admin/AnnualScheduleEditor'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { toWarekiYear } from '@/lib/date-utils'

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

  const supabase = await createClient()
  const events = await getAnnualEvents(year)
  const { data: settings } = await supabase.from('organization_settings').select('*').single()
  const eraName = settings?.wareki_era_name || '令和'
  const startYear = settings?.wareki_start_year || 2019

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 bg-white shadow rounded-lg print:shadow-none print:p-0 print:max-w-3xl print:mx-auto">
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
            {toWarekiYear(year, eraName, startYear)}度のイベントスケジュールを管理します。
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Year switcher could go here if we want to jump years easily within this page */
             /* For now, FiscalYearSwitcher in header handles global context */}
        </div>
      </div>

      <AnnualScheduleEditor year={year} events={events || []} eraName={eraName} startYear={startYear} />
    </div>
  )
}
