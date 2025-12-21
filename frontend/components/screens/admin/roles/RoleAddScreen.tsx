import RoleForm from '@/components/admin/roles/RoleForm'
import { AdminPage } from '@/components/admin/patterns/AdminPage'
import { Box } from '@/ui/layout/Box'

interface RoleAddScreenProps {
  initialDisplayOrder: number
}

export function RoleAddScreen({ initialDisplayOrder }: RoleAddScreenProps) {
  return (
    <AdminPage.Root maxWidth="5xl">
      <AdminPage.Header
        title="役職の追加"
        description="新しい役職を作成し、権限や表示設定を構成します。"
      />

      <AdminPage.Content>
        <Box className="bg-background shadow-sm border border-border sm:rounded-lg overflow-hidden">
          <Box className="px-4 py-5 sm:p-6">
            <RoleForm initialDisplayOrder={initialDisplayOrder} />
          </Box>
        </Box>
      </AdminPage.Content>
    </AdminPage.Root>
  )
}
