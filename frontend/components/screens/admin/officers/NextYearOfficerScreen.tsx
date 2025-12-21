import OfficerSelectionCard from '@/components/admin/officers/OfficerSelectionCard'
import PrintButton from '@/components/admin/PrintButton'
import Link from 'next/link'
import { Box } from '@/ui/layout/Box'
import { Heading } from '@/ui/primitives/Heading'
import { Text } from '@/ui/primitives/Text'

interface NextYearOfficerScreenProps {
  nextWarekiYear: string
  nextFiscalYear: number
  roles: any[]
  assignments: any[]
  sortedAssignments: any[]
  profiles: any[]
}

export function NextYearOfficerScreen({
  nextWarekiYear,
  nextFiscalYear,
  roles,
  assignments,
  sortedAssignments,
  profiles
}: NextYearOfficerScreenProps) {
  return (
    <Box className="print:p-8">
      <Box className="print:hidden">
        <Box className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <Heading size="h1" className="text-xl font-semibold text-gray-900">{`次年度(${nextWarekiYear}度) 役員選出`}</Heading>
            <Text className="mt-2 text-sm text-gray-600">
              来年度の役員をあらかじめ選出・任命します。ここで選出された役員は、来年度の役員名簿に自動的に反映されます。
            </Text>
          </div>
          <Box className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex items-center gap-3">
            <Link
              href="/admin/officers"
              className="block rounded-md bg-white px-3 py-2 text-center text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              役員一覧に戻る
            </Link>
            <PrintButton label="名簿をPDFにする" />
          </Box>
        </Box>
      </Box>

      <Box className="hidden print:block mb-8 text-center">
        <Heading size="h1" className="text-2xl font-bold border-b-2 border-black pb-2 mb-2">{nextWarekiYear}度 役員名簿</Heading>
        <Text className="block text-right text-sm">発行日: {new Date().toLocaleDateString()}</Text>
        <Box className="font-bold text-right mt-2">
          計 {new Set((assignments || []).map((a: any) => a.profile_id)).size} 名
        </Box>
      </Box>

      <Box className="mt-6 print:hidden">
        <Box className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
          <Box className="flex">
            <Box className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </Box>
            <Box className="ml-3">
              <Text className="text-sm text-yellow-700">
                現在は <strong>{nextFiscalYear}年度（{nextWarekiYear}年度）</strong> の役員を選出しています。<br />
                ここで設定された役員は、任期が <strong>{nextFiscalYear}年4月1日 〜 {nextFiscalYear + 1}年3月31日</strong> で登録されます。
              </Text>
            </Box>
          </Box>
        </Box>

        <Box className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => {
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
        </Box>
      </Box>

      {/* Print View Table */}
      <Box className="hidden print:block mt-6">
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
            {sortedAssignments.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-center text-sm text-gray-500">任命された役員はいません</td>
              </tr>
            ) : (
              sortedAssignments.map((assignment: any, index: number) => {
                const prevAssignment = sortedAssignments[index - 1]
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
              })
            )}
          </tbody>
        </table>
      </Box>
    </Box>
  )
}
