import RoleForm from '@/components/admin/roles/RoleForm'
import RoleScheduleEditor from '@/components/admin/RoleScheduleEditor'
import { Box } from '@/ui/layout/Box'
import { AdminPage } from '@/components/admin/patterns/AdminPage'

interface RoleEditScreenProps {
  role: any
  tasks: any[]
}

export function RoleEditScreen({ role, tasks }: RoleEditScreenProps) {
  return (
    <AdminPage.Root>
      <AdminPage.Header
        title="役職の編集"
        description="役職の基本情報および年間スケジュールを管理します。"
      />

      <AdminPage.Content>
        <Box className="bg-background shadow-sm border border-border sm:rounded-lg overflow-hidden">
          <Box className="px-4 py-5 sm:p-6">
            <RoleForm role={role} />
          </Box>
        </Box>

        <Box className="bg-background shadow-sm border border-border sm:rounded-lg overflow-hidden">
          <Box className="px-4 py-3 sm:px-6 border-b border-border bg-muted/30">
            <h3 className="text-lg font-bold text-foreground">年間スケジュール設定</h3>
          </Box>
          <Box className="px-4 py-5 sm:p-6">
            <RoleScheduleEditor roleId={role.id} tasks={tasks} />
          </Box>
        </Box>
      </AdminPage.Content>
    </AdminPage.Root>
  )
}
