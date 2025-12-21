import AdminFormLayout from '@/components/admin/AdminFormLayout'
import AdminUserForm from '@/components/admin/users/AdminUserForm'
import AdminChildList from '@/components/admin/users/AdminChildList'
import Link from 'next/link'
import { Box } from '@/ui/layout/Box'
import { Stack } from '@/ui/layout/Stack'
import { Heading } from '@/ui/primitives/Heading'
import { Text } from '@/ui/primitives/Text'

interface UserEditScreenProps {
  id: string
  profile: any
  children: any[]
  targetFiscalYear: number
  backView: string
}

export function UserEditScreen({
  id,
  profile,
  children,
  targetFiscalYear,
  backView
}: UserEditScreenProps) {
  return (
    <AdminFormLayout
      title="会員情報の編集"
      backLink={{ href: `/admin/members?view=${backView}`, label: '会員名簿に戻る' }}
    >
      <Stack className="gap-8">
        {/* Parent Profile Section */}
        <Box className="bg-background shadow-sm border border-border sm:rounded-lg">
          <Box className="px-4 py-5 sm:px-6 border-b border-border">
            <Heading size="h3" className="text-lg font-medium leading-6 text-foreground">保護者情報</Heading>
            <Text className="mt-1 max-w-2xl text-sm text-muted-foreground">保護者の基本情報を編集します。</Text>
          </Box>
          <Box className="px-4 py-5 sm:p-6">
            <AdminUserForm profile={profile} />
          </Box>
        </Box>

        {/* Children Management Section */}
        <Box className="bg-background shadow-sm border border-border sm:rounded-lg">
          <Box className="px-4 py-5 sm:px-6 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <Heading size="h3" className="text-lg font-medium leading-6 text-foreground">お子様情報</Heading>
              <Text className="mt-1 max-w-2xl text-sm text-muted-foreground">登録されているお子様の一覧です。</Text>
            </div>
            <Link
              href={`/admin/users/${id}/children/new`}
              className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              お子様を追加
            </Link>
          </Box>
          <Box className="px-4 py-5 sm:p-6">
            <AdminChildList
              childrenData={children}
              parentId={id}
              targetFiscalYear={targetFiscalYear}
            />
          </Box>
        </Box>
      </Stack>
    </AdminFormLayout>
  )
}
