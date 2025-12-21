import { createClient } from '@/lib/supabase/server'
import { getTargetFiscalYear, getOrganizationSettings } from '@/app/admin/actions/settings'
import { getAnnualEvents } from '@/app/actions/events'
import { getFiscalReports, getFiscalReportWithItems, getAccountingInfo } from '@/app/admin/actions/accounting'
import { getConstitution } from '@/app/admin/actions/constitution'
import { GeneralAssemblyHub } from '@/components/screens/admin/general-assembly/GeneralAssemblyHub'
import { toWarekiYear } from '@/lib/date-utils'

export const dynamic = 'force-dynamic'

export default async function GeneralAssemblyPage() {
  const supabase = await createClient()

  // 1. Settings & Year
  const targetFiscalYear = await getTargetFiscalYear()
  const nextFiscalYear = targetFiscalYear + 1
  const settings = await getOrganizationSettings()
  const eraName = settings?.wareki_era_name || '令和'
  const startYear = settings?.wareki_start_year || 2019

  // 2. Events
  const currentEvents = await getAnnualEvents(targetFiscalYear)
  const nextEvents = await getAnnualEvents(nextFiscalYear)

  // 3. Fiscal Reports
  // Fetch all reports for current and next year to find the correct ones
  const allReportsCurrent = await getFiscalReports(targetFiscalYear)
  const allReportsNext = await getFiscalReports(nextFiscalYear)

  // Find Settlement (Current Year)
  const settlementReportSummary = allReportsCurrent?.find(r => r.report_type === 'settlement')
  let settlementReport = null
  if (settlementReportSummary) {
    settlementReport = await getFiscalReportWithItems(settlementReportSummary.id)
  }

  // Find Budget (Next Year)
  const budgetReportSummary = allReportsNext?.find(r => r.report_type === 'budget')
  let budgetReport = null
  if (budgetReportSummary) {
    budgetReport = await getFiscalReportWithItems(budgetReportSummary.id)
  }

  // Accounting Info for Display (Accountant Name, Auditor Name)
  const accountingInfoCurrent = await getAccountingInfo(targetFiscalYear)
  const accountingInfoNext = await getAccountingInfo(nextFiscalYear)


  // 4. Officers (Next Year)
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

  const nextWarekiYear = toWarekiYear(nextFiscalYear, eraName, startYear)

  // 5. Constitution
  const constitution = await getConstitution()

  // 6. Distribution Status
  const { data: distributionData } = await supabase
    .from('general_assembly_materials')
    .select('material_type, is_distributed')
    .eq('fiscal_year', targetFiscalYear)

  const distributionMap = (distributionData || []).reduce((acc: any, item: any) => {
    acc[item.material_type] = item.is_distributed
    return acc
  }, {})

  return (
    <GeneralAssemblyHub
      targetFiscalYear={targetFiscalYear}
      nextFiscalYear={nextFiscalYear}
      settings={settings}
      currentEvents={currentEvents || []}
      nextEvents={nextEvents || []}
      settlementReport={settlementReport}
      budgetReport={budgetReport}
      accountingInfoCurrent={accountingInfoCurrent}
      accountingInfoNext={accountingInfoNext}
      officerData={{
        nextWarekiYear,
        nextFiscalYear,
        roles: roles || [],
        assignments: assignments || [],
        sortedAssignments: sortedAssignments || [],
        profiles: profiles || []
      }}
      constitution={constitution}
      distributionMap={distributionMap}
    />
  )
}
