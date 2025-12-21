import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { getTargetFiscalYear } from '@/app/admin/actions/settings'
import { UserEditScreen } from '@/components/screens/admin/users/UserEditScreen'

type MemberView = 'child' | 'guardian' | 'officer'

export default async function AdminUserEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { id } = await params
  const sParams = await searchParams
  const supabase = await createClient()

  const requestedView = sParams?.view as string | undefined
  const backView: MemberView =
    requestedView === 'guardian' || requestedView === 'officer' ? requestedView : 'child'

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!profile) {
    notFound()
  }

  const { data: children } = await supabase
    .from('children')
    .select('*')
    .eq('parent_id', id)
    .is('deleted_at', null)
    .order('birthday', { ascending: false })

  const targetFiscalYear = await getTargetFiscalYear()

  return (
    <UserEditScreen
      id={id}
      profile={profile}
      children={children || []}
      targetFiscalYear={targetFiscalYear}
      backView={backView}
    />
  )
}
