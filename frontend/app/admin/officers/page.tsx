
import { createClient } from '@/lib/supabase/server'
import { deleteAssignment } from '../actions/officer'

import AdminPageHeader from '@/components/admin/AdminPageHeader'

export default async function AdminOfficersPage() {
  const supabase = await createClient()

  const { data: assignments } = await supabase
    .from('officer_role_assignments')
    .select(`
        *,
        role:officer_roles(*),
        profile:profiles(full_name, email, last_name_kana, first_name_kana)
    `)
  // .order('fiscal_year', { ascending: false })
  // .order('display_order', { foreignTable: 'role', ascending: true }) // DB sort attempt
  // .order('created_at', { ascending: false })

  const { data: rolesDebug } = await supabase.from('officer_roles').select('*')
  console.log('DEBUG: Officer Roles:', JSON.stringify(rolesDebug, null, 2))


  const sortedAssignments = assignments?.sort((a, b) => {
    // 1. Fiscal Year (desc)
    if (a.fiscal_year !== b.fiscal_year) {
      return b.fiscal_year - a.fiscal_year
    }
    // 2. Role Display Order (asc)
    const orderA = a.role?.display_order ?? 999
    const orderB = b.role?.display_order ?? 999
    if (orderA !== orderB) {
      return orderA - orderB
    }
    // 3. Created At (desc)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <div>
      <AdminPageHeader
        title="役員任命・管理"
        description="各メンバーの役職と任期を管理します。"
        action={{ label: '役員を任命する', href: '/admin/officers/new' }}
      />

      <div className="flow-root">

        <div className="overflow-hidden bg-white shadow sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200">
            {sortedAssignments?.length === 0 ? (
              <li className="px-4 py-4 sm:px-6 text-gray-500 text-center">任命された役員はいません</li>
            ) : (
              sortedAssignments?.map((assignment: any) => (
                <li key={assignment.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{assignment.role.name}</span>
                        <span className="text-xs text-gray-500 border rounded px-1 bg-gray-50">{assignment.fiscal_year}年度</span>
                      </div>
                      <div className="mt-1">
                        <p className="text-sm font-medium text-indigo-600">{assignment.profile.full_name}</p>
                        <p className="text-xs text-gray-400">{assignment.profile.last_name_kana} {assignment.profile.first_name_kana}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{assignment.profile.email}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        任期: {assignment.start_date} 〜 {assignment.end_date}
                      </p>
                    </div>
                    <form action={deleteAssignment}>
                      <input type="hidden" name="id" value={assignment.id} />
                      <button type="submit" className="text-sm text-red-600 hover:text-red-800 border-red-100 border px-2 py-1 rounded bg-red-50">解除</button>
                    </form>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div >
  )
}
