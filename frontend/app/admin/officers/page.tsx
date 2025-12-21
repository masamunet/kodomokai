import { createClient } from '@/lib/supabase/server'
import { toWarekiYear } from '@/lib/date-utils'
import { getTargetFiscalYear } from '../actions/settings'
import { OfficerListScreen } from '@/components/screens/admin/officers/OfficerListScreen'

export const dynamic = 'force-dynamic'

export default async function AdminOfficersPage() {
  const supabase = await createClient()

  const currentFiscalYear = await getTargetFiscalYear()

  const { data: assignments } = await supabase
    .from('officer_role_assignments')
    .select(`
        *,
        role:officer_roles(*),
        profile:profiles(full_name, email, last_name_kana, first_name_kana, address, phone)
    `)
    .eq('fiscal_year', currentFiscalYear)
    .order('role(display_order)', { ascending: true })
    .order('created_at', { ascending: false })

  const { data: settings } = await supabase.from('organization_settings').select('*').single()
  const warekiEraName = settings?.wareki_era_name || '令和'
  const warekiStartYear = settings?.wareki_start_year || 2019

  const titleYear = toWarekiYear(currentFiscalYear, warekiEraName, warekiStartYear)

  return (
    <OfficerListScreen
      assignments={assignments || []}
      titleYear={titleYear}
    />
  )
}
