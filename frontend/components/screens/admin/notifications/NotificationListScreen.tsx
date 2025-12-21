import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { Box } from '@/ui/layout/Box'
import { Text } from '@/ui/primitives/Text'

interface NotificationListScreenProps {
  notifications: any[]
}

export function NotificationListScreen({ notifications }: NotificationListScreenProps) {
  return (
    <Box>
      <AdminPageHeader
        title="お知らせ配信履歴"
        description="過去に配信したお知らせの一覧です。"
        action={{ label: '新規配信', href: '/admin/notifications/new' }}
      />

      <Box className="overflow-hidden bg-white shadow sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {notifications.length === 0 ? (
            <li className="px-4 py-4 sm:px-6 text-gray-500 text-center">
              <Text>配信履歴がありません</Text>
            </li>
          ) : (
            notifications.map((notification) => (
              <li key={notification.id} className="block hover:bg-gray-50">
                <Box className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <Text weight="medium" className="truncate text-sm text-indigo-600">{notification.subject}</Text>
                    <div className="ml-2 flex flex-shrink-0">
                      <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                        {new Date(notification.sent_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <Text className="flex items-center text-sm text-gray-500">
                        配信数: {notification.notification_recipients?.[0]?.count ?? 0} 人
                      </Text>
                    </div>
                  </div>
                </Box>
              </li>
            ))
          )}
        </ul>
      </Box>
    </Box>
  )
}
