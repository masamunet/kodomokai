import Link from 'next/link'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import EventListEditButton from '@/components/admin/EventListEditButton'
import { Box } from '@/ui/layout/Box'
import { Stack } from '@/ui/layout/Stack'
import { Text } from '@/ui/primitives/Text'

interface EventListScreenProps {
  events: any[]
}

export function EventListScreen({ events }: EventListScreenProps) {
  return (
    <Box>
      <AdminPageHeader
        title="イベント管理"
        description="子ども会のイベント作成・編集・出欠管理を行います。"
        action={{ label: 'イベント新規作成', href: '/admin/events/new' }}
      />

      <Box className="overflow-hidden bg-white shadow sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {events.length === 0 ? (
            <li className="px-4 py-4 sm:px-6 text-gray-500 text-center">
              <Text>イベントがありません</Text>
            </li>
          ) : (
            events.map((event) => (
              <li key={event.id} className="relative block hover:bg-gray-50">
                <Link href={`/admin/events/${event.id}`} className="block px-4 py-4 sm:px-6 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Text className="truncate text-sm font-medium text-indigo-600">{event.title}</Text>
                    </div>
                    <div className="ml-2 flex flex-shrink-0">
                      <Text className="inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5 text-blue-800">
                        {new Date(event.scheduled_date).toLocaleDateString()}
                        {event.start_time && ` ${event.start_time.slice(0, 5)}`}
                      </Text>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <Text className="flex items-center text-sm text-gray-500">
                        {event.location || '場所未定'}
                      </Text>
                    </div>
                    {event.rsvp_required && (
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <Text>出欠確認あり (締切: {event.rsvp_deadline ? new Date(event.rsvp_deadline).toLocaleDateString() : 'なし'})</Text>
                      </div>
                    )}
                  </div>
                </Link>
                <div className="absolute top-4 right-4 sm:static sm:ml-4 sm:flex-shrink-0">
                  <EventListEditButton eventId={event.id} />
                </div>
              </li>
            ))
          )}
        </ul>
      </Box>
    </Box>
  )
}
