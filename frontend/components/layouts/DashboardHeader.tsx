import Link from 'next/link'
import FiscalYearSwitcher from '@/components/FiscalYearSwitcher'
import { MessageCircleQuestion, User, LayoutDashboard, LogOut } from 'lucide-react'
import { Box } from '@/ui/layout/Box'
import { HStack } from '@/ui/layout/Stack'
import { Heading } from '@/ui/primitives/Heading'
import { Button } from '@/ui/primitives/Button'

interface DashboardHeaderProps {
  profile: any
  targetFiscalYear: number
}

export function DashboardHeader({ profile, targetFiscalYear }: DashboardHeaderProps) {
  return (
    <Box asChild className="bg-background shadow-sm border-b border-border sticky top-0 z-50">
      <header>
        <Box className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <HStack className="gap-4 items-center">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <HStack className="gap-2 items-center">
                <Box className="bg-primary/10 p-2 rounded-lg text-primary">
                  <LayoutDashboard size={24} />
                </Box>
                <Heading size="h1" className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">ダッシュボード</Heading>
              </HStack>
            </Link>
            <FiscalYearSwitcher currentYear={targetFiscalYear} />
          </HStack>

          <HStack className="gap-2 sm:gap-3 items-center flex-wrap justify-center">
            <Button variant="outline" size="sm" asChild activeScale={true} className="gap-2 h-9 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary">
              <Link href="/forum">
                <MessageCircleQuestion size={16} />
                質問掲示板
              </Link>
            </Button>

            {profile?.is_admin && (
              <Button variant="ghost" size="sm" asChild activeScale={true} className="gap-2 h-9 text-xs">
                <Link href="/admin/templates">
                  管理者
                </Link>
              </Button>
            )}

            <Button variant="ghost" size="sm" asChild activeScale={true} className="gap-2 h-9 text-xs">
              <Link href="/profile">
                <User size={14} />
                マイページ
              </Link>
            </Button>

            <form action="/auth/signout" method="post">
              <Button type="submit" variant="ghost" size="sm" activeScale={true} className="gap-2 h-9 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors">
                <LogOut size={14} />
                ログアウト
              </Button>
            </form>
          </HStack>
        </Box>
      </header>
    </Box>
  )
}
