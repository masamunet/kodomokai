
import AssignmentForm from '@/components/admin/officers/AssignmentForm'
import { createClient } from '@/lib/supabase/server'
import AdminFormLayout from '@/components/admin/AdminFormLayout'

export default async function NewOfficerPage() {
  const supabase = await createClient()

  // Fetch master data for dropdowns
  const { data: roles } = await supabase.from('officer_roles').select('*').order('display_order', { ascending: true }).order('name')
  const { data: profiles } = await supabase.from('profiles').select('id, full_name, email').order('full_name')

  return (
    <AdminFormLayout
      title="役員の任命"
      backLink={{ href: '/admin/officers', label: '役員一覧に戻る' }}
    >
      <AssignmentForm roles={roles || []} profiles={profiles || []} />
    </AdminFormLayout>
  )
}
