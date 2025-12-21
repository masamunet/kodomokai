import { notFound } from 'next/navigation'
import { getFiscalReportWithItems, getAccountingInfo } from '@/app/admin/actions/accounting'
import { getOrganizationSettings } from '@/app/admin/actions/settings'
import { AccountingEditScreen } from '@/components/screens/admin/accounting/AccountingEditScreen'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditAccountingPage({ params }: Props) {
  const { id } = await params
  const report = await getFiscalReportWithItems(id)
  const settings = await getOrganizationSettings()
  const currentYear = settings?.fiscal_year || new Date().getFullYear()

  if (!report) {
    notFound()
  }

  const accountingInfo = await getAccountingInfo(report.fiscal_year || currentYear)

  return (
    <AccountingEditScreen
      report={report}
      currentYear={currentYear}
      accountingInfo={accountingInfo}
    />
  )
}
