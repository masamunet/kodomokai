import { getFiscalReports } from '@/app/admin/actions/accounting'
import { getOrganizationSettings } from '@/app/admin/actions/settings'
import { AccountingListScreen } from '@/components/screens/admin/accounting/AccountingListScreen'

export default async function AccountingListPage() {
  const reports = await getFiscalReports()
  const settings = await getOrganizationSettings()
  const currentYear = settings?.fiscal_year || new Date().getFullYear()

  return <AccountingListScreen reports={reports} currentYear={currentYear} />
}
