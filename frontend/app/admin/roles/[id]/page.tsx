import { createClient } from '@/lib/supabase/server'
import RoleForm from '../new/RoleForm'
import { notFound } from 'next/navigation'
import AdminFormLayout from '@/components/admin/AdminFormLayout'
import RoleScheduleEditor from '@/components/admin/RoleScheduleEditor'

export default async function EditRolePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: role } = await supabase
    .from('officer_roles')
    .select('*')
    .eq('id', id)
    .single()

  if (!role) {
    notFound()
  }

  // Fetch tasks
  const { data: tasks } = await supabase
    .from('officer_tasks')
    .select('*')
    .eq('role_id', id)
    .order('target_month', { ascending: true }) // Initial sort, but client will filter
  // Note: You might want to sort by updated_at or create proper sorting on client side

  return (
    <AdminFormLayout
      title="役職の編集"
      backLink={{ href: '/admin/roles', label: '役職一覧に戻る' }}
    >
      <RoleForm role={role} />

      <div className="border-t pt-8 mt-8">
        <RoleScheduleEditor roleId={role.id} tasks={tasks || []} />
      </div>
    </AdminFormLayout>
  )
}
