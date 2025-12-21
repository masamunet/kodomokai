import AdminPageHeader from '@/components/admin/AdminPageHeader'
import PrintButton from '@/components/admin/PrintButton'
import { deleteAssignment } from '@/app/admin/actions/officer'
import { Box } from '@/ui/layout/Box'
import { Stack } from '@/ui/layout/Stack'

interface OfficerListScreenProps {
  assignments: any[]
  titleYear: string
}

export function OfficerListScreen({ assignments, titleYear }: OfficerListScreenProps) {
  const uniqueCount = new Set((assignments || []).map((a: any) => a.profile_id)).size

  return (
    <Box className="print:p-8">
      <Box className="print:hidden">
        <AdminPageHeader
          title="役員任命・管理"
          description="各メンバーの役職と任期を管理します。"
          action={{ label: '役員を任命する', href: '/admin/officers/new' }}
        />
      </Box>

      <Box className="hidden print:block mb-8 text-center">
        <h1 className="text-2xl font-bold border-b-2 border-black pb-2 mb-2">{titleYear}度 役員名簿</h1>
        <p className="text-right text-sm">発行日: {new Date().toLocaleDateString()}</p>
      </Box>

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
                現在の任命数: <span className="font-bold text-lg">{uniqueCount}名</span>
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/admin/officers/next-year"
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            次年度役員選出
          </a>
          <PrintButton label="役員一覧をPDFにする" />
        </div>
      </div>

      <div className="hidden print:block mb-4 text-right pr-4 font-bold">
        計 {uniqueCount} 名
      </div>

      <div className="flow-root mt-6 print:hidden">
        <div className="overflow-hidden bg-white shadow sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200 border-t border-gray-200">
            {(assignments || []).length === 0 ? (
              <li className="px-4 py-4 sm:px-6 text-gray-500 text-center">任命された役員はいません</li>
            ) : (
              (assignments || []).map((assignment: any) => (
                <li key={assignment.id} className="px-4 py-4 sm:px-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    {/* Role & Year - Fixed width on desktop for alignment */}
                    <div className="flex items-center gap-2 sm:w-48 shrink-0">
                      <span className="font-bold text-gray-900 text-lg">{assignment.role?.name}</span>
                    </div>

                    {/* Name & Meta Info - Flex grow */}
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6 min-w-0">
                      <div className="flex flex-col">
                        <div className="flex items-baseline gap-2 shrink-0">
                          <p className="text-sm font-medium text-indigo-600">{assignment.profile.full_name}</p>
                          <p className="text-xs text-gray-400 whitespace-nowrap">({assignment.profile.last_name_kana} {assignment.profile.first_name_kana})</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 min-w-0">
                        <span className="truncate">{assignment.profile.email}</span>
                        <span className="whitespace-nowrap text-gray-400">任期: {assignment.start_date} 〜 {assignment.end_date}</span>
                      </div>
                    </div>

                    {/* Actions - Right aligned */}
                    <form action={deleteAssignment} className="sm:ml-auto">
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

      {/* Print View Table */}
      <div className="hidden print:block mt-6">
        <table className="w-full text-left border-collapse border border-black">
          <thead>
            <tr className="border-b-2 border-black bg-gray-50">
              <th className="px-4 py-2 text-sm font-bold text-gray-900 w-40 border-r border-black">役職</th>
              <th className="px-4 py-2 text-sm font-bold text-gray-900 w-48 border-r border-black">氏名</th>
              <th className="px-4 py-2 text-sm font-bold text-gray-900 border-r border-black">住所</th>
              <th className="px-4 py-2 text-sm font-bold text-gray-900 w-40">電話番号</th>
            </tr>
          </thead>
          <tbody>
            {(assignments || []).map((assignment: any, index: number) => {
              const prevAssignment = (assignments || [])[index - 1]
              const isSameRole = prevAssignment && prevAssignment.role_id === assignment.role_id

              return (
                <tr key={assignment.id} className={`${isSameRole ? '' : 'border-t border-black'}`}>
                  <td className="px-4 py-2 text-sm text-gray-900 align-top border-r border-black">
                    {!isSameRole && assignment.role?.name}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 align-top border-r border-black">
                    {assignment.profile.full_name}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 align-top border-r border-black">
                    {assignment.profile.address}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 align-top">
                    {assignment.profile.phone}
                  </td>
                </tr>
              )
            })}
            {(assignments || []).length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-center text-sm text-gray-500">任命された役員はいません</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Box>
  )
}
