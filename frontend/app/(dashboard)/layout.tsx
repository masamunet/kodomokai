import { createClient } from '@/lib/supabase/server'
import { getTargetFiscalYear } from '@/lib/fiscal-year'
import { DashboardHeader } from '@/components/layouts/DashboardHeader'
import { Box } from '@/ui/layout/Box'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const targetFiscalYear = await getTargetFiscalYear()

  return (
    <Box className="min-h-screen bg-muted/30">
      <DashboardHeader profile={profile} targetFiscalYear={targetFiscalYear} />
      <Box className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </Box>
    </Box>
  )
}
