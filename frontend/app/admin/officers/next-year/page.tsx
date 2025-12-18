import { createClient } from '@/lib/supabase/server'
import { toWarekiYear } from '@/lib/date-utils'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import OfficerSelectionCard from './OfficerSelectionCard'
import PrintButton from '@/components/admin/PrintButton'
import Link from 'next/link'
import { getTargetFiscalYear } from '../../actions/settings'

export const dynamic = 'force-dynamic'

export default async function NextYearOfficerSelectionPage() {
  const supabase = await createClient()

  // Calculate Next Fiscal Year
  const currentFiscalYear = await getTargetFiscalYear()
  const nextFiscalYear = currentFiscalYear + 1

  // Fetch Logic
  const { data: settings } = await supabase.from('organization_settings').select('*').single()
  const warekiEraName = settings?.wareki_era_name || '令和'
  const warekiStartYear = settings?.wareki_start_year || 2019
  const nextWarekiYear = toWarekiYear(nextFiscalYear, warekiEraName, warekiStartYear)

  const { data: roles } = await supabase
    .from('officer_roles')
    .select('*')
    .order('display_order', { ascending: true })
    .order('name')

  const { data: assignments } = await supabase
    .from('officer_role_assignments')
    .select(`
        *,
        role:officer_roles(name, display_order),
        profile:profiles(id, full_name, email, last_name_kana, first_name_kana, address, phone)
    `)
    .eq('fiscal_year', nextFiscalYear)
    // Sort for PDF
    .order('fiscal_year', { ascending: false })

  // Sort assignments in code if needed for PDF, but DB sort is better if possible.
  // Since we query by fiscal_year, we just need to sort by role order.
  // However officer_role_assignments does not have role display order directly, it's joined.
  // We can sort in JS for the print view.
  const sortedAssignments = (assignments || []).sort((a: any, b: any) => {
    return (a.role?.display_order || 0) - (b.role?.display_order || 0)
  })

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email, last_name_kana, first_name_kana')
    .order('full_name')

  return (
    <div className="print:p-8">
      <div className="print:hidden">
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{`次年度(${nextWarekiYear}度) 役員選出`}</h1>
            <p className="mt-2 text-sm text-gray-600">
              来年度の役員をあらかじめ選出・任命します。ここで選出された役員は、来年度の役員名簿に自動的に反映されます。
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex items-center gap-3">
            <Link
              href="/admin/officers"
              className="block rounded-md bg-white px-3 py-2 text-center text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              役員一覧に戻る
            </Link>
            <PrintButton label="名簿をPDFにする" />
          </div>
        </div>
      </div>

      <div className="hidden print:block mb-8 text-center">
        <h1 className="text-2xl font-bold border-b-2 border-black pb-2 mb-2">{nextWarekiYear}度 役員名簿</h1>
        <p className="text-right text-sm">発行日: {new Date().toLocaleDateString()}</p>
        <div className="font-bold text-right mt-2">
          計 {new Set((assignments || []).map((a: any) => a.profile_id)).size} 名
        </div>
      </div>

      <div className="mt-6 print:hidden">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                現在は <strong>{nextFiscalYear}年度（{nextWarekiYear}年度）</strong> の役員を選出しています。<br />
                ここで設定された役員は、任期が <strong>{nextFiscalYear}年4月1日 〜 {nextFiscalYear + 1}年3月31日</strong> で登録されます。
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {roles?.map((role) => {
            const roleAssignments = assignments?.filter((a: any) => a.role_id === role.id) || []
            return (
              <OfficerSelectionCard
                key={role.id}
                role={role}
                assignments={roleAssignments}
                profiles={profiles || []}
                nextFiscalYear={nextFiscalYear}
              />
            )
          })}
        </div>
      </div>

      {/* Print View Table */}
      <div className="hidden print:block mt-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="py-2 text-sm font-bold text-gray-900 w-40">役職</th>
              <th className="py-2 text-sm font-bold text-gray-900 w-48">氏名</th>
              <th className="py-2 text-sm font-bold text-gray-900">住所</th>
              <th className="py-2 text-sm font-bold text-gray-900 w-40">電話番号</th>
            </tr>
          </thead>
          <tbody>
            {sortedAssignments.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-4 text-center text-sm text-gray-500">任命された役員はいません</td>
              </tr>
            ) : (
              sortedAssignments.map((assignment: any, index: number) => {
                const prevAssignment = sortedAssignments[index - 1]
                const isSameRole = prevAssignment && prevAssignment.role_id === assignment.role_id

                return (
                  <tr key={assignment.id} className={`${isSameRole ? '' : 'border-t border-black'}`}>
                    <td className="py-2 text-sm text-gray-900 align-top">
                      {!isSameRole && assignment.role?.name}
                    </td>
                    <td className="py-2 text-sm text-gray-900 align-top">
                      {assignment.profile.full_name}
                    </td>
                    <td className="py-2 text-sm text-gray-900 align-top">
                      {assignment.profile.address}
                    </td>
                    <td className="py-2 text-sm text-gray-900 align-top">
                      {assignment.profile.phone}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
