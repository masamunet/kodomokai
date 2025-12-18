import { getOrganizationSettings } from '@/app/admin/actions/settings'
import AccountingEditor from '@/components/admin/accounting/AccountingEditor'

export default async function NewAccountingPage() {
  const settings = await getOrganizationSettings()
  const currentYear = settings?.fiscal_year || new Date().getFullYear()

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="print:hidden">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">会計報告の作成</h1>
        <p className="text-muted-foreground text-sm">項目を入力して、決算報告書または予算案を作成します</p>
      </div>

      <AccountingEditor currentYear={currentYear} />
    </div>
  )
}
