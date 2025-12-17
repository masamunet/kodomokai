import Link from 'next/link'
import { getTargetFiscalYear } from './actions/settings'
import FiscalYearSwitcher from '@/components/FiscalYearSwitcher'
import Breadcrumbs from '@/components/Breadcrumbs'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const targetFiscalYear = await getTargetFiscalYear()

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="bg-white shadow-md border-b border-border">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">管理者ダッシュボード</h1>
            <div className="bg-muted rounded p-1">
              <FiscalYearSwitcher currentYear={targetFiscalYear} theme="light" />
            </div>
          </div>
          <nav className="flex gap-4 items-center">
            <Link href="/admin/templates" className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors">
              テンプレート
            </Link>
            <Link href="/admin/events" className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors">
              イベント
            </Link>
            <Link href="/admin/members" className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors">
              名簿
            </Link>
            <div className="h-6 w-px bg-border mx-2" />
            <Link href="/admin/roles" className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors">
              役職
            </Link>
            <Link href="/admin/officers" className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors">
              任命
            </Link>
            <Link href="/admin/settings" className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors">
              設定
            </Link>
            <div className="h-6 w-px bg-border mx-2" />
            <Link href="/admin/notifications" className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors">
              配信
            </Link>
            <Link href="/" className="ml-4 text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors">
              ホームへ
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
        <Breadcrumbs />
        {children}
      </main>
    </div>
  )
}
