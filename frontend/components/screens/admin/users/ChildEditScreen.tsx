import AdminChildForm from '@/components/admin/users/AdminChildForm'
import { Box } from '@/ui/layout/Box'
import { Text } from '@/ui/primitives/Text'
import { AdminPage } from '@/components/admin/patterns/AdminPage'

interface ChildEditScreenProps {
  parentId: string
  profile: { full_name: string }
  child: any
}

export function ChildEditScreen({ parentId, profile, child }: ChildEditScreenProps) {
  return (
    <AdminPage.Root maxWidth="5xl">
      <AdminPage.Header
        title="お子様情報の編集"
        description="お子様の基本情報を管理します。"
      />

      <AdminPage.Content>
        <Box className="bg-background shadow-sm border border-border sm:rounded-lg overflow-hidden">
          <Box className="px-4 py-5 sm:px-6 border-b border-border bg-muted/30">
            <Text className="text-sm text-muted-foreground">
              保護者: <Text weight="bold" className="text-foreground">{profile.full_name}</Text>
            </Text>
          </Box>
          <Box className="px-4 py-5 sm:p-6">
            <AdminChildForm parentId={parentId} child={child} />
          </Box>
        </Box>
      </AdminPage.Content>
    </AdminPage.Root>
  )
}
