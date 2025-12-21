import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { RoleEditScreen } from '@/components/screens/admin/roles/RoleEditScreen'

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
    .order('target_month', { ascending: true })

  return <RoleEditScreen role={role} tasks={tasks || []} />
}
