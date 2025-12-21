import AdminUserForm from '@/components/admin/users/AdminUserForm'
import AdminChildList from '@/components/admin/users/AdminChildList'
import Link from 'next/link'
import { Box } from '@/ui/layout/Box'
import { Stack, HStack } from '@/ui/layout/Stack'
import { Heading } from '@/ui/primitives/Heading'
import { Text } from '@/ui/primitives/Text'
import { AdminPage } from '@/components/admin/patterns/AdminPage'
import { Button } from '@/ui/primitives/Button'
import { Plus } from 'lucide-react'

interface UserEditScreenProps {
  id: string
  profile: any
  childList: any[]
  targetFiscalYear: number
  backView: string
}

export function UserEditScreen({
  id,
  profile,
  childList,
  targetFiscalYear,
  backView
}: UserEditScreenProps) {
  return (
    <AdminPage.Root>
      <AdminPage.Header
        title="会員情報の編集"
        description="保護者および登録されているお子様の情報を管理します。"
      />

      <AdminPage.Content>
        <Stack className="gap-8">
          {/* Parent Profile Section */}
          <Box className="bg-background shadow-sm border border-border sm:rounded-lg overflow-hidden">
            <Box className="px-4 py-5 sm:px-6 border-b border-border bg-muted/30">
              <Heading size="h3" className="text-lg font-bold text-foreground">保護者情報</Heading>
              <Text className="mt-1 text-sm text-muted-foreground">保護者の基本情報を編集します。</Text>
            </Box>
            <Box className="px-4 py-5 sm:p-6">
              <AdminUserForm profile={profile} />
            </Box>
          </Box>

          {/* Children Management Section */}
          <Box className="bg-background shadow-sm border border-border sm:rounded-lg overflow-hidden">
            <Box className="px-4 py-5 sm:px-6 border-b border-border bg-muted/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <Heading size="h3" className="text-lg font-bold text-foreground">お子様情報</Heading>
                <Text className="mt-1 text-sm text-muted-foreground">登録されているお子様の一覧です。</Text>
              </div>
              <Button asChild activeScale={true} className="gap-2">
                <Link href={`/admin/users/${id}/children/new`}>
                  <Plus className="h-4 w-4" />
                  お子様を追加
                </Link>
              </Button>
            </Box>
            <Box className="px-4 py-5 sm:p-6">
              <AdminChildList
                childrenData={childList}
                parentId={id}
                targetFiscalYear={targetFiscalYear}
              />
            </Box>
          </Box>
        </Stack>
      </AdminPage.Content>
    </AdminPage.Root>
  )
}
