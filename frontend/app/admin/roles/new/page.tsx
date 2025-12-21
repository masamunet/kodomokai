import { createClient } from '@/lib/supabase/server'
import { RoleAddScreen } from '@/components/screens/admin/roles/RoleAddScreen'

export default async function NewRolePage() {
  const supabase = await createClient()

  // Get max display_order to suggest next value
  const { data: roles } = await supabase
    .from('officer_roles')
    .select('display_order')
    .order('display_order', { ascending: false })
    .limit(1)

  const nextDisplayOrder = roles && roles.length > 0 ? (roles[0].display_order || 0) + 1 : 1

  return <RoleAddScreen initialDisplayOrder={nextDisplayOrder} />
}
