import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { RoleList } from './RoleList'

export default async function AdminRolesPage() {
  const supabase = await createClient()
  const { data: roles } = await supabase
    .from('officer_roles')
    .select('*')
    .order('display_order', { ascending: true })
    .order('name')

  return (
    <div>
      <AdminPageHeader
        title="役職管理"
        description="役員の役職を管理します。"
        action={{ label: '役職を追加', href: '/admin/roles/new' }}
      />
      <div className="mt-8 flow-root">
        <RoleList initialRoles={roles || []} />
      </div>
    </div>
  )
}
