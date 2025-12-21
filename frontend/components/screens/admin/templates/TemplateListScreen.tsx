import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { Box } from '@/ui/layout/Box'
import { Stack } from '@/ui/layout/Stack'
import { Text } from '@/ui/primitives/Text'

type Template = {
  id: string
  name: string
  subject: string
  created_at: string
}

interface TemplateListScreenProps {
  templates: Template[]
}

export function TemplateListScreen({ templates }: TemplateListScreenProps) {
  return (
    <Stack className="gap-8">
      <AdminPageHeader
        title="テンプレート一覧"
        description="お知らせ配信用のテンプレートを管理します。"
        action={{ label: '新規作成', href: '/admin/templates/new' }}
      />

      <Box className="overflow-hidden bg-white shadow sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {templates.length === 0 ? (
            <li className="px-4 py-4 sm:px-6 text-gray-500 text-center">
              <Text>テンプレートがありません</Text>
            </li>
          ) : (
            templates.map((template) => (
              <li key={template.id} className="block hover:bg-gray-50">
                <Box className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <Text className="truncate text-sm font-medium text-indigo-600">{template.name}</Text>
                    <div className="ml-2 flex flex-shrink-0">
                      <Text className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                        {new Date(template.created_at).toLocaleDateString()}
                      </Text>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <Text className="flex items-center text-sm text-gray-500">
                        件名: {template.subject}
                      </Text>
                    </div>
                  </div>
                </Box>
              </li>
            ))
          )}
        </ul>
      </Box>
    </Stack>
  )
}
