import RoleForm from '@/components/admin/roles/RoleForm'
import AdminFormLayout from '@/components/admin/AdminFormLayout'

interface RoleAddScreenProps {
  initialDisplayOrder: number
}

export function RoleAddScreen({ initialDisplayOrder }: RoleAddScreenProps) {
  return (
    <AdminFormLayout
      title="役職の追加"
      backLink={{ href: '/admin/roles', label: '役職一覧に戻る' }}
    >
      <RoleForm initialDisplayOrder={initialDisplayOrder} />
    </AdminFormLayout>
  )
}
