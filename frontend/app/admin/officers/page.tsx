
import { createClient } from '@/lib/supabase/server'
import { deleteAssignment } from '../actions/officer'

import AdminPageHeader from '@/components/admin/AdminPageHeader'

export const dynamic = 'force-dynamic'

export default async function AdminOfficersPage() {
  const supabase = await createClient()

  const { data: assignments } = await supabase
    .from('officer_role_assignments')
    .select(`
        *,
        role:officer_roles(*),
        profile:profiles(full_name, email, last_name_kana, first_name_kana)
    `)
    .order('fiscal_year', { ascending: false })
    .order('display_order', { foreignTable: 'role', ascending: true })
    .order('created_at', { ascending: false })

  return (
    <div>
      <AdminPageHeader
        title="役員任命・管理"
        description="各メンバーの役職と任期を管理します。"
        action={{ label: '役員を任命する', href: '/admin/officers/new' }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4">
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                現在の任命数: <span className="font-bold text-lg">{assignments?.length || 0}名</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flow-root mt-6">

        <div className="overflow-hidden bg-white shadow sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200">
            {assignments?.length === 0 ? (
              <li className="px-4 py-4 sm:px-6 text-gray-500 text-center">任命された役員はいません</li>
            ) : (
              assignments?.map((assignment: any) => (
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
