import Link from 'next/link'
import FiscalYearSwitcher from '@/components/FiscalYearSwitcher'
import Breadcrumbs from '@/components/Breadcrumbs'
import { HelpCircle } from 'lucide-react'
import AdminNavLinks from '@/components/admin/AdminNavLinks'
import { Box } from '@/ui/layout/Box'

interface AdminLayoutProps {
  children: React.ReactNode
  targetFiscalYear: number
  unansweredCount: number
}

export function AdminLayoutView({
  children,
  targetFiscalYear,
  unansweredCount,
}: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/70 shadow-sm backdrop-blur-md backdrop-saturate-150 supports-[backdrop-filter]:bg-background/55 print:hidden">
        <div className="mx-auto flex h-16 w-full max-w-[1920px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 shrink-0">
            <Link href="/admin" className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground whitespace-nowrap">役員DB</h1>
            </Link>
            <div className="bg-muted rounded p-1 hidden sm:block">
              <FiscalYearSwitcher currentYear={targetFiscalYear} theme="light" />
            </div>
            {unansweredCount > 0 && (
              <Link href="/forum" className="flex items-center gap-1.5 ml-2 bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-bold hover:bg-pink-200 transition-colors shadow-sm">
                <HelpCircle size={14} />
                掲示板: {unansweredCount}
              </Link>
            )}
          </div>

          <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar ml-4">
            <Link href="/admin/meetings" className="text-primary-foreground bg-primary hover:bg-primary/90 px-3 py-1.5 rounded-md text-sm font-medium shadow-sm transition-colors whitespace-nowrap">
              定例会
            </Link>
            <Link href="/admin/events/annual" className="text-primary-foreground bg-primary/90 hover:bg-primary px-3 py-1.5 rounded-md text-sm font-medium shadow-sm transition-colors whitespace-nowrap ml-2">
              年間予定
            </Link>
            <div className="h-5 w-px bg-border mx-2 shrink-0" />

            <AdminNavLinks />

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
