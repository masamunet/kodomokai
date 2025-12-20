import { notFound } from 'next/navigation'
import { getFiscalReportWithItems, getAccountingInfo } from '@/app/admin/actions/accounting'
import { getOrganizationSettings } from '@/app/admin/actions/settings'
import AccountingEditor from '@/components/admin/accounting/AccountingEditor'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditAccountingPage({ params }: Props) {
  const { id } = await params
  const report = await getFiscalReportWithItems(id)
  const settings = await getOrganizationSettings()
  const currentYear = settings?.fiscal_year || new Date().getFullYear()
  // Use report's fiscal year, or current year if somehow missing (though it shouldn't be)
  const accountingInfo = await getAccountingInfo(report?.fiscal_year || currentYear)

  if (!report) {
    notFound()
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="print:hidden">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">会計報告の編集</h1>
        <p className="text-muted-foreground text-sm">{report.title} の内容を編集します</p>
      </div>

      <AccountingEditor initialData={report} currentYear={currentYear} accountingInfo={accountingInfo} />
    </div>
  )
}
