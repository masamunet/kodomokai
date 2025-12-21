import { DashboardHeader } from '@/components/layouts/DashboardHeader'
import { Box } from '@/ui/layout/Box'

interface DashboardLayoutProps {
  children: React.ReactNode
  profile: any
  targetFiscalYear: number
}

export function DashboardLayoutScreen({ children, profile, targetFiscalYear }: DashboardLayoutProps) {
  return (
    <Box className="min-h-screen bg-muted/30">
      <DashboardHeader profile={profile} targetFiscalYear={targetFiscalYear} />
      <Box className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </Box>
    </Box>
  )
}
