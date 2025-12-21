import { createClient } from '@/lib/supabase/server'
import { toWarekiYear } from '@/lib/date-utils'
import { getTargetFiscalYear } from '@/app/admin/actions/settings'
import { NextYearOfficerScreen } from '@/components/screens/admin/officers/NextYearOfficerScreen'

export const dynamic = 'force-dynamic'

export default async function NextYearOfficerSelectionPage() {
  const supabase = await createClient()

  // Calculate Next Fiscal Year
  const currentFiscalYear = await getTargetFiscalYear()
  const nextFiscalYear = currentFiscalYear + 1

  // Fetch Logic
  const { data: settings } = await supabase.from('organization_settings').select('*').single()
  const warekiEraName = settings?.wareki_era_name || '令和'
  const warekiStartYear = settings?.wareki_start_year || 2019
  const nextWarekiYear = toWarekiYear(nextFiscalYear, warekiEraName, warekiStartYear)

  const { data: roles } = await supabase
    .from('officer_roles')
    .select('*')
    .order('display_order', { ascending: true })
    .order('name')

  const { data: assignments } = await supabase
    .from('officer_role_assignments')
    .select(`
        *,
        role:officer_roles(name, display_order),
        profile:profiles(id, full_name, email, last_name_kana, first_name_kana, address, phone)
    `)
    .eq('fiscal_year', nextFiscalYear)
    .order('fiscal_year', { ascending: false })

  const sortedAssignments = (assignments || []).sort((a: any, b: any) => {
    return (a.role?.display_order || 0) - (b.role?.display_order || 0)
  })

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email, last_name_kana, first_name_kana')
    .order('full_name')

  return (
    <NextYearOfficerScreen
      nextWarekiYear={nextWarekiYear}
      nextFiscalYear={nextFiscalYear}
      roles={roles || []}
      assignments={assignments || []}
      sortedAssignments={sortedAssignments}
      profiles={profiles || []}
    />
  )
}
