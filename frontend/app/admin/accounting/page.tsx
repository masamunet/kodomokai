import { getTargetFiscalYear } from '@/lib/fiscal-year'
import { getFiscalReports } from '@/app/admin/actions/accounting'
import { AccountingListScreen } from '@/components/screens/admin/accounting/AccountingListScreen'

export default async function AccountingListPage() {
  const reports = await getFiscalReports()
  const currentYear = await getTargetFiscalYear()

  return <AccountingListScreen reports={reports} currentYear={currentYear} />
}
