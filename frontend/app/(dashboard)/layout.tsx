import { createClient } from '@/lib/supabase/server'
import { getTargetFiscalYear } from '@/lib/fiscal-year'
import { DashboardLayoutScreen } from '@/components/layouts/DashboardLayout'
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
    <DashboardLayoutScreen profile={profile} targetFiscalYear={targetFiscalYear}>
      {children}
    </DashboardLayoutScreen>
  )
}
