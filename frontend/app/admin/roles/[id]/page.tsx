import { createClient } from '@/lib/supabase/server'
import RoleForm from '../new/RoleForm'
import { notFound } from 'next/navigation'
import AdminFormLayout from '@/components/admin/AdminFormLayout'

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

  return (
    <AdminFormLayout
      title="役職の編集"
      backLink={{ href: '/admin/roles', label: '役職一覧に戻る' }}
    >
      <RoleForm role={role} />
    </AdminFormLayout>
  )
}
