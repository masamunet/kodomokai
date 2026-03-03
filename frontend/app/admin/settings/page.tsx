import { createClient } from '@/lib/supabase/server'
import { SettingsScreen } from '@/components/screens/admin/settings/SettingsScreen'
import { getTargetFiscalYear } from '@/app/admin/actions/settings'
import { getAnnualSettings } from '@/app/admin/actions/annual_settings'

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  const { data: settings } = await supabase.from('organization_settings').select('*').single()

  const targetFiscalYear = await getTargetFiscalYear()
  const annualSettingsData = await getAnnualSettings(targetFiscalYear)

  const initialData = {
    name: settings?.name || '子供会',
    startMonth: settings?.fiscal_year_start_month || 4,
    warekiEraName: settings?.wareki_era_name || '令和',
    warekiStartYear: settings?.wareki_start_year || 2019,
    admissionFee: settings?.admission_fee || 0,
    annualFee: settings?.annual_fee || 0,
  }

  const initialAnnualData = {
    fiscalYear: targetFiscalYear,
    invitationCode: annualSettingsData?.invitation_code || ''
  }

  return <SettingsScreen initialData={initialData} initialAnnualData={initialAnnualData} />
}
