import { AdminPage } from '@/components/admin/patterns/AdminPage'
import PrintButton from '@/components/admin/PrintButton'
import { deleteAssignment } from '@/app/admin/actions/officer'
import { Box } from '@/ui/layout/Box'
import { Stack, HStack } from '@/ui/layout/Stack'
import { Text } from '@/ui/primitives/Text'
import { Heading } from '@/ui/primitives/Heading'
import { ClickableListItem } from '@/components/admin/patterns/ClickableListItem'
import { Button } from '@/ui/primitives/Button'

interface OfficerListScreenProps {
  assignments: any[]
  titleYear: string
}

export function OfficerListScreen({ assignments, titleYear }: OfficerListScreenProps) {
  const uniqueCount = new Set((assignments || []).map((a: any) => a.profile_id)).size

  return (
    <AdminPage.Root className="print:p-0">
      <Box className="print:hidden">
        <AdminPage.Header
          title="役員任命・管理"
          description="各メンバーの役職と任期を管理します。"
          action={{ label: '役員を任命する', href: '/admin/officers/new' }}
        />
      </Box>

      {/* Print-only Header */}
      <Box className="hidden print:block mb-8 text-center">
        <Heading size="h1" className="text-2xl font-bold border-b-2 border-black pb-2 mb-2">
          {titleYear}度 役員名簿
        </Heading>
        <Text className="text-right text-sm block">発行日: {new Date().toLocaleDateString()}</Text>
      </Box>

      <AdminPage.Content>
        <Box className="print:hidden">
          <HStack className="justify-between items-center mb-6 gap-4">
            <Box className="bg-primary/5 border-l-4 border-primary p-4 flex-1">
              <HStack className="items-center gap-3">
                <Box className="text-primary">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </Box>
                <Text className="text-sm text-primary-foreground/80">
                  現在の任命数: <Text weight="bold" className="text-lg text-primary">{uniqueCount}名</Text>
                </Text>
              </HStack>
            </Box>
            <HStack className="items-center gap-3">
              <Button variant="outline" size="sm" asChild>
                <a href="/admin/officers/next-year">次年度役員選出</a>
              </Button>
              <PrintButton label="役員一覧をPDFにする" />
            </HStack>
          </HStack>
        </Box>

        <Box className="hidden print:block mb-4 text-right font-bold">
          計 {uniqueCount} 名
        </Box>

        <Box className="print:hidden">
          <Stack className="gap-3">
            {(assignments || []).length === 0 ? (
              <Box className="p-12 text-center text-muted-foreground bg-muted/10 border border-dashed border-border rounded-lg">
                任命された役員はいません
              </Box>
            ) : (
              (assignments || []).map((assignment: any) => (
                <ClickableListItem
                  key={assignment.id}
                  href={`/admin/users/${assignment.profile_id}?view=officer`}
                >
                  <Box className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <Box className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                      <Box className="sm:w-40 shrink-0">
                        <Text weight="bold" className="text-lg text-foreground block">
                          {assignment.role?.name}
                        </Text>
                      </Box>

                      <Box>
                        <HStack className="items-baseline gap-2 mb-1">
                          <Text weight="semibold" className="text-primary">
                            {assignment.profile.full_name}
                          </Text>
                          <Text className="text-xs text-muted-foreground">
                            ({assignment.profile.last_name_kana} {assignment.profile.first_name_kana})
                          </Text>
                        </HStack>
                        <HStack className="text-xs text-muted-foreground gap-4 flex-wrap">
                          <Text>{assignment.profile.email}</Text>
                          <Text>任期: {assignment.start_date} 〜 {assignment.end_date}</Text>
                        </HStack>
                      </Box>
                    </Box>

                    <form action={deleteAssignment} className="sm:ml-auto">
                      <input type="hidden" name="id" value={assignment.id} />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8"
                      >
                        解除
                      </Button>
                    </form>
                  </Box>
                </ClickableListItem>
              ))
            )}
          </Stack>
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
        </Box>
      </AdminPage.Content>
    </AdminPage.Root>
  )
}
