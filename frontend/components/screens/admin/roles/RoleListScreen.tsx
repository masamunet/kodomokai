import { AdminPage } from '@/components/admin/patterns/AdminPage'
import { RoleList } from '@/components/admin/roles/RoleList'

type Role = {
  id: string
  name: string
  description?: string | null
  display_order: number | null
  created_at: string
  is_visible_in_docs: boolean | null
}

interface RoleListScreenProps {
  roles: Role[]
}

export function RoleListScreen({ roles }: RoleListScreenProps) {
  return (
    <AdminPage.Root>
      <AdminPage.Header
        title="役職管理"
        description="役員の役職を管理します。"
        action={{ label: '役職を追加', href: '/admin/roles/new' }}
      />
      <AdminPage.Content>
        <RoleList initialRoles={roles} />
      </AdminPage.Content>
    </AdminPage.Root>
  )
}
