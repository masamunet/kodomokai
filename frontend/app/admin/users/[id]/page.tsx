import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AdminFormLayout from '@/components/admin/AdminFormLayout'
import AdminUserForm from '@/components/admin/users/AdminUserForm'
import AdminChildList from '@/components/admin/users/AdminChildList'
import Link from 'next/link'

type MemberView = 'child' | 'guardian' | 'officer'

export default async function AdminUserEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { id } = await params
  const resolvedSearchParams = await searchParams
  const supabase = await createClient()

  const requestedView = resolvedSearchParams?.view as string | undefined
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
    .order('birthday', { ascending: false })

  return (
    <AdminFormLayout
      title="会員情報の編集"
      backLink={{ href: `/admin/members?view=${backView}`, label: '会員名簿に戻る' }}
    >
      <div className="space-y-8">
        {/* Parent Profile Section */}
        <div className="bg-background shadow-sm border border-border sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-border">
            <h3 className="text-lg font-medium leading-6 text-foreground">保護者情報</h3>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">保護者の基本情報を編集します。</p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <AdminUserForm profile={profile} />
          </div>
        </div>

        {/* Children Management Section */}
        <div className="bg-background shadow-sm border border-border sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-medium leading-6 text-foreground">お子様情報</h3>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">登録されているお子様の一覧です。</p>
            </div>
            <Link
              href={`/admin/users/${id}/children/new`}
              className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              お子様を追加
            </Link>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <AdminChildList childrenData={children || []} parentId={id} />
          </div>
        </div>
      </div>
    </AdminFormLayout>
  )
}
