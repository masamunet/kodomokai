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
      <header className="bg-card shadow-sm border-b border-border sticky top-0 z-50 print:hidden">
        <div className="mx-auto flex h-16 w-full max-w-[1920px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 shrink-0">
            <Link href="/admin" className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground whitespace-nowrap">役員DB</h1>
            </Link>
            <div className="bg-muted rounded p-1 hidden sm:block">
              <FiscalYearSwitcher currentYear={targetFiscalYear} theme="light" />
            </div>
          </div>

          <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar ml-4">
            <Link href="/admin/meetings" className="text-primary-foreground bg-primary hover:bg-primary/90 px-3 py-1.5 rounded-md text-sm font-medium shadow-sm transition-colors whitespace-nowrap">
              定例会
            </Link>
            <Link href="/admin/events/annual" className="text-primary-foreground bg-indigo-500 hover:bg-indigo-600 ml-2 px-3 py-1.5 rounded-md text-sm font-medium shadow-sm transition-colors whitespace-nowrap">
              年間予定
            </Link>
            <div className="h-5 w-px bg-border mx-2 shrink-0" />

            <NavLinks />

            <div className="h-5 w-px bg-border mx-2 shrink-0" />
            <Link href="/" className="text-primary-foreground bg-primary hover:bg-primary/90 px-3 py-1.5 rounded-md text-sm font-medium shadow-sm transition-colors whitespace-nowrap ml-2">
              ホーム
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1920px] flex-1 p-4 sm:p-6 lg:p-8 print:p-0 print:w-auto print:max-w-none">
        <div className="print:hidden">
          <Breadcrumbs />
        </div>
        {children}
      </main>
    </div>
  )
}

function NavLinks() {
  return (
    <>
      <Link href="/admin/templates" className="text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:bg-muted transition-colors whitespace-nowrap">
        テンプレート
      </Link>
      <Link href="/admin/events" className="text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:bg-muted transition-colors whitespace-nowrap">
        イベント
      </Link>
      <Link href="/admin/members" className="text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:bg-muted transition-colors whitespace-nowrap">
        名簿
      </Link>
      <Link href="/admin/users/import" className="text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:bg-muted transition-colors whitespace-nowrap">
        一括登録
      </Link>
      <div className="h-5 w-px bg-border mx-2 shrink-0" />
      <Link href="/admin/roles" className="text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:bg-muted transition-colors whitespace-nowrap">
        役職
      </Link>
      <Link href="/admin/officers" className="text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:bg-muted transition-colors whitespace-nowrap">
        任命
      </Link>
      <Link href="/admin/settings" className="text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:bg-muted transition-colors whitespace-nowrap">
        設定
      </Link>
      <div className="h-5 w-px bg-border mx-2 shrink-0" />
      <Link href="/admin/notifications" className="text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:bg-muted transition-colors whitespace-nowrap">
        配信
      </Link>
    </>
  )
}
