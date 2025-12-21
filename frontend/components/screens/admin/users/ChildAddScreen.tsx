import AdminFormLayout from '@/components/admin/AdminFormLayout'
import AdminChildForm from '@/components/admin/users/AdminChildForm'
import { Box } from '@/ui/layout/Box'
import { Text } from '@/ui/primitives/Text'

interface ChildAddScreenProps {
  parentId: string
  profile: { full_name: string }
}

export function ChildAddScreen({ parentId, profile }: ChildAddScreenProps) {
  return (
    <AdminFormLayout
      title="お子様の追加"
      backLink={{ href: `/admin/users/${parentId}`, label: '会員編集に戻る' }}
    >
      <Box className="bg-white shadow sm:rounded-lg overflow-hidden">
        <Box className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <Text className="text-sm text-gray-500">
            保護者: <Text weight="medium" className="text-gray-900">{profile.full_name}</Text>
          </Text>
        </Box>
        <AdminChildForm parentId={parentId} />
      </Box>
    </AdminFormLayout>
  )
}
