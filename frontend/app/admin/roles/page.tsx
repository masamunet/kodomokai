import { createClient } from '@/lib/supabase/server'
import { RoleListScreen } from '@/components/screens/admin/roles/RoleListScreen'

export default async function AdminRolesPage() {
  const supabase = await createClient()
  const { data: roles } = await supabase
    .from('officer_roles')
    .select('*')
    .order('display_order', { ascending: true })
    .order('name')

  return <RoleListScreen roles={roles || []} />
}
