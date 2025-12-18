import Link from 'next/link'
import { getFiscalReports } from '@/app/admin/actions/accounting'
import { getOrganizationSettings } from '@/app/admin/actions/settings'

export default async function AccountingListPage() {
  const reports = await getFiscalReports()
  const settings = await getOrganizationSettings()
  const currentYear = settings?.fiscal_year || new Date().getFullYear()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">会計報告</h1>
          <p className="text-muted-foreground text-sm">決算報告書および予算案の管理</p>
        </div>
        <Link
          href="/admin/accounting/new"
          className="inline-flex items-center justify-center rounded-md text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 shadow-sm"
        >
          新規作成
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {reports.length === 0 ? (
          <div className="bg-card border border-border p-16 rounded-xl text-center shadow-sm">
            <p className="text-muted-foreground">会計報告がまだありません。「新規作成」から始めましょう。</p>
          </div>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="bg-card border border-border p-5 rounded-xl flex items-center justify-between group hover:border-primary/30 hover:shadow-md transition-all">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                    {report.fiscal_year}年度
                  </span>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent ${report.report_type === 'settlement'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
                    }`}>
                    {report.report_type === 'settlement' ? '決算報告' : '予算案'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground">{report.title}</h3>
                <p className="text-xs text-muted-foreground">最終更新: {new Date(report.updated_at).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/accounting/${report.id}/edit`}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  <span className="sr-only">編集</span>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
