import { getTargetFiscalYear } from '@/lib/fiscal-year'
import { getAccountingInfo } from '@/app/admin/actions/accounting'
import { AccountingAddScreen } from '@/components/screens/admin/accounting/AccountingAddScreen'

export default async function NewAccountingPage() {
  const currentYear = await getTargetFiscalYear()
  const accountingInfo = await getAccountingInfo(currentYear)

  return <AccountingAddScreen currentYear={currentYear} accountingInfo={accountingInfo} />
}
