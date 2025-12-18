
import { createClient } from '@/lib/supabase/server'
import { deleteAssignment } from '../actions/officer'

import AdminPageHeader from '@/components/admin/AdminPageHeader'

import PrintButton from '@/components/admin/PrintButton'

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
    .order('role(display_order)', { ascending: true })
    .order('created_at', { ascending: false })

  const currentYear = assignments?.[0]?.fiscal_year || new Date().getFullYear()

  return (
    <div className="print:p-8">
      <div className="print:hidden">
        <AdminPageHeader
          title="役員任命・管理"
          description="各メンバーの役職と任期を管理します。"
          action={{ label: '役員を任命する', href: '/admin/officers/new' }}
        />
      </div>

      <div className="hidden print:block mb-8 text-center">
        <h1 className="text-2xl font-bold border-b-2 border-black pb-2 mb-2">{currentYear}年度 役員名簿</h1>
        <p className="text-right text-sm">発行日: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="flex justify-between items-center mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4 print:hidden">
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 flex-1 mr-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                現在の任命数: <span className="font-bold text-lg">{(assignments || []).length}名</span>
              </p>
            </div>
          </div>
        </div>
        <PrintButton label="役員一覧をPDFにする" />
      </div>

      <div className="hidden print:block mb-4 text-right pr-4 font-bold">
        計 {(assignments || []).length} 名
      </div>

      <div className="flow-root mt-6 print:mt-0">

        <div className="overflow-hidden bg-white shadow sm:rounded-md print:shadow-none">
          <ul role="list" className="divide-y divide-gray-200 print:divide-black border-t border-gray-200 print:border-black print:border-b">
            {(assignments || []).length === 0 ? (
              <li className="px-4 py-4 sm:px-6 text-gray-500 text-center">任命された役員はいません</li>
            ) : (
              (assignments || []).map((assignment: any) => (
                <li key={assignment.id} className="px-4 py-4 sm:px-6 print:py-2 print:px-2 print:break-inside-avoid">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    {/* Role & Year - Fixed width on desktop for alignment */}
                    <div className="flex items-center gap-2 sm:w-48 shrink-0">
                      <span className="font-bold text-gray-900 text-lg print:text-base">{assignment.role?.name}</span>
                    </div>

                    {/* Name & Meta Info - Flex grow */}
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6 min-w-0">
                      <div className="flex items-baseline gap-2 shrink-0">
                        <p className="text-sm font-medium text-indigo-600 print:text-black print:text-lg whitespace-nowrap">{assignment.profile.full_name}</p>
                        <p className="text-xs text-gray-400 print:hidden whitespace-nowrap">({assignment.profile.last_name_kana} {assignment.profile.first_name_kana})</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 print:text-black min-w-0">
                        <span className="print:hidden truncate">{assignment.profile.email}</span>
                        <span className="print:hidden whitespace-nowrap text-gray-400">任期: {assignment.start_date} 〜 {assignment.end_date}</span>
                      </div>
                    </div>

                    {/* Actions - Right aligned */}
                    <form action={deleteAssignment} className="print:hidden sm:ml-auto">
                      <input type="hidden" name="id" value={assignment.id} />
                      <button type="submit" className="text-sm text-red-600 hover:text-red-800 border-red-100 border px-2 py-1 rounded bg-red-50 whitespace-nowrap">解除</button>
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
