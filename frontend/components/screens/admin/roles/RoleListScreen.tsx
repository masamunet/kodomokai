import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { RoleList } from '@/components/admin/roles/RoleList'
import { Box } from '@/ui/layout/Box'
import { Stack } from '@/ui/layout/Stack'

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
    <Stack className="gap-8">
      <AdminPageHeader
        title="役職管理"
        description="役員の役職を管理します。"
        action={{ label: '役職を追加', href: '/admin/roles/new' }}
      />
      <Box className="mt-8 flow-root">
        <RoleList initialRoles={roles} />
      </Box>
    </Stack>
  )
}
