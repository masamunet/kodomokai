import RoleForm from './RoleForm'
import AdminFormLayout from '@/components/admin/AdminFormLayout'

export default function NewRolePage() {
  return (
    <AdminFormLayout
      title="役職の追加"
      backLink={{ href: '/admin/roles', label: '役職一覧に戻る' }}
    >
      <RoleForm />
    </AdminFormLayout>
  )
}
