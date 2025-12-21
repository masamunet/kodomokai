import { getAnnualEvents } from '@/app/actions/events'
import { getTargetFiscalYear } from '@/app/admin/actions/settings'
import { createClient } from '@/lib/supabase/server'
import { AnnualScheduleScreen } from '@/components/screens/admin/events/AnnualScheduleScreen'

export default async function AnnualEventsPage({
  searchParams,
}: {
  searchParams: { year?: string }
}) {
  const sp = await searchParams
  const settingsYear = await getTargetFiscalYear()
  const year = sp.year ? parseInt(sp.year) : settingsYear

  const supabase = await createClient()
  const events = await getAnnualEvents(year)
  const { data: settings } = await supabase.from('organization_settings').select('*').single()
  const eraName = settings?.wareki_era_name || '令和'
  const startYear = settings?.wareki_start_year || 2019

  return (
    <AnnualScheduleScreen
      year={year}
      events={events || []}
      eraName={eraName}
      startYear={startYear}
    />
  )
}
