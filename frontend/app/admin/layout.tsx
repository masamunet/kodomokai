import { getTargetFiscalYear } from './actions/settings'
import { getUnansweredCount } from '@/app/actions/forum'
import { AdminLayoutView } from '@/components/layouts/AdminLayout'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const targetFiscalYear = await getTargetFiscalYear()
  const unansweredCount = await getUnansweredCount()

  return (
    <AdminLayoutView
      targetFiscalYear={targetFiscalYear}
      unansweredCount={unansweredCount}
    >
      {children}
    </AdminLayoutView>
  )
}
