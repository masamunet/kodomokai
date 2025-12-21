import { getOrganizationSettings } from '@/app/admin/actions/settings'
import { getAccountingInfo } from '@/app/admin/actions/accounting'
import { AccountingAddScreen } from '@/components/screens/admin/accounting/AccountingAddScreen'

export default async function NewAccountingPage() {
  const settings = await getOrganizationSettings()
  const currentYear = settings?.fiscal_year || new Date().getFullYear()
  const accountingInfo = await getAccountingInfo(currentYear)

  return <AccountingAddScreen currentYear={currentYear} accountingInfo={accountingInfo} />
}
