import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getDistributedMaterials } from '@/app/admin/actions/general-assembly'
import { MemberGeneralAssemblyScreen } from '@/components/screens/general-assembly/MemberGeneralAssemblyScreen'
import { Box } from '@/ui/layout/Box'
import { getOrganizationSettings, getTargetFiscalYear } from '@/app/admin/actions/settings'
import { getAnnualEvents } from '@/app/actions/events'
import { getFiscalReportWithItems, getAccountingInfo, getFiscalReports } from '@/app/admin/actions/accounting'
import { getConstitution } from '@/app/admin/actions/constitution'
import { toWarekiYear } from '@/lib/date-utils'

export const dynamic = 'force-dynamic'

export default async function GeneralAssemblyPage() {
  const supabase = await createClient()

  // 1. Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Get Settings & Fiscal Year
  const settings = await getOrganizationSettings()
  const targetFiscalYear = await getTargetFiscalYear()

  if (!settings) {
    return <Box>システム設定が見つかりません。管理者に連絡してください。</Box>
  }

  const nextFiscalYear = targetFiscalYear + 1

  // 3. Get Distributed Materials Status
  const distributedMaterialsList = await getDistributedMaterials(targetFiscalYear)
  const distributedMaterials = distributedMaterialsList.reduce((acc: Record<string, boolean>, curr: any) => {
    acc[curr.material_type] = curr.is_distributed
    return acc
  }, {})

  // 4. Fetch additional data needed (using helpers where possible for consistency)

  // Events
  const currentEvents = await getAnnualEvents(targetFiscalYear)
  const nextEvents = await getAnnualEvents(nextFiscalYear)

  // Accounting Reports
  const allReportsCurrent = await getFiscalReports(targetFiscalYear)
  const allReportsNext = await getFiscalReports(nextFiscalYear)

  // Settlement (Current)
  const settlementReportSummary = allReportsCurrent?.find(r => r.report_type === 'settlement')
  let settlementReport = null
  if (settlementReportSummary) {
    settlementReport = await getFiscalReportWithItems(settlementReportSummary.id)
  }

  // Budget (Next)
  const budgetReportSummary = allReportsNext?.find(r => r.report_type === 'budget')
  let budgetReport = null
  if (budgetReportSummary) {
    budgetReport = await getFiscalReportWithItems(budgetReportSummary.id)
  }

  // Accounting Info
  const accountingInfoCurrent = await getAccountingInfo(targetFiscalYear)
  const accountingInfoNext = await getAccountingInfo(nextFiscalYear)

  // Officer Data (Next Year)
  const { data: roles } = await supabase.from('officer_roles').select('*').order('display_order')
  const { data: assignments } = await supabase
    .from('officer_role_assignments')
    .select('*, profile:profiles(*), role:officer_roles(*)')
    .eq('fiscal_year', nextFiscalYear)

  const { data: profiles } = await supabase.from('profiles').select('*').order('kana_name')

  // Sort assignments
  const sortedAssignments = (assignments || []).sort((a, b) => {
    const roleOrderA = a.role?.display_order ?? 999
    const roleOrderB = b.role?.display_order ?? 999
    if (roleOrderA !== roleOrderB) return roleOrderA - roleOrderB
    return (a.profile?.kana_name || '').localeCompare(b.profile?.kana_name || '')
  })

  const nextWarekiYear = toWarekiYear(nextFiscalYear, settings.wareki_era_name, settings.wareki_start_year)

  const officerData = {
    nextWarekiYear,
    nextFiscalYear,
    roles: roles || [],
    assignments: assignments || [],
    sortedAssignments,
    profiles: profiles || []
  }

  // Constitution
  const constitution = await getConstitution()

  return (
    <MemberGeneralAssemblyScreen
      targetFiscalYear={targetFiscalYear}
      nextFiscalYear={nextFiscalYear}
      settings={settings}
      currentEvents={currentEvents || []}
      nextEvents={nextEvents || []}
      settlementReport={settlementReport}
      budgetReport={budgetReport}
      accountingInfoCurrent={accountingInfoCurrent}
      accountingInfoNext={accountingInfoNext}
      officerData={officerData}
      constitution={constitution}
      distributedMaterials={distributedMaterials}
    />
  )
}
