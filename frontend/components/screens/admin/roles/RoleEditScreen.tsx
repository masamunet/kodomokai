import RoleForm from '@/components/admin/roles/RoleForm'
import AdminFormLayout from '@/components/admin/AdminFormLayout'
import RoleScheduleEditor from '@/components/admin/RoleScheduleEditor'
import { Box } from '@/ui/layout/Box'

interface RoleEditScreenProps {
  role: any
  tasks: any[]
}

export function RoleEditScreen({ role, tasks }: RoleEditScreenProps) {
  return (
    <AdminFormLayout
      title="役職の編集"
      backLink={{ href: '/admin/roles', label: '役職一覧に戻る' }}
    >
      <RoleForm role={role} />

      <Box className="border-t pt-8 mt-8">
        <RoleScheduleEditor roleId={role.id} tasks={tasks} />
      </Box>
    </AdminFormLayout>
  )
}
