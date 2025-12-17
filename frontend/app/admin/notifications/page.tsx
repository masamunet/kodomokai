import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

import AdminPageHeader from '@/components/admin/AdminPageHeader'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*, notification_recipients(count)')
    .order('sent_at', { ascending: false })

  return (
    <div>
      <AdminPageHeader
        title="お知らせ配信履歴"
        description="過去に配信したお知らせの一覧です。"
        action={{ label: '新規配信', href: '/admin/notifications/new' }}
      />

      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {notifications?.length === 0 ? (
            <li className="px-4 py-4 sm:px-6 text-gray-500 text-center">配信履歴がありません</li>
          ) : (
            notifications?.map((notification) => (
              <li key={notification.id} className="block hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-medium text-indigo-600">{notification.subject}</p>
                    <div className="ml-2 flex flex-shrink-0">
                      <p className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                        {new Date(notification.sent_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        配信数: {notification.notification_recipients?.[0]?.count ?? 0} 人
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}
