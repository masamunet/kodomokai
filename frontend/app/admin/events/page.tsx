import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Edit } from 'lucide-react'

import AdminPageHeader from '@/components/admin/AdminPageHeader'

export default async function AdminEventsPage() {
  const supabase = await createClient()
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('scheduled_date', { ascending: false })
    .order('start_time', { ascending: true })

  return (
    <div>
      <AdminPageHeader
        title="イベント管理"
        description="子ども会のイベント作成・編集・出欠管理を行います。"
        action={{ label: 'イベント新規作成', href: '/admin/events/new' }}
      />

      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {events?.length === 0 ? (
            <li className="px-4 py-4 sm:px-6 text-gray-500 text-center">イベントがありません</li>
          ) : (
            events?.map((event) => (
              <li key={event.id} className="block hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/events/${event.id}`} className="block hover:underline">
                        <p className="truncate text-sm font-medium text-indigo-600">{event.title}</p>
                      </Link>
                      <Link
                        href={`/admin/events/${event.id}/edit`}
                        className="text-gray-400 hover:text-indigo-600 p-1 hover:bg-indigo-50 rounded"
                        title="編集"
                      >
                        <Edit size={16} />
                      </Link>
                    </div>
                    <div className="ml-2 flex flex-shrink-0">
                      <p className="inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5 text-blue-800">
                        {new Date(event.scheduled_date).toLocaleDateString()}
                        {event.start_time && ` ${event.start_time.slice(0, 5)}`}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        {event.location || '場所未定'}
                      </p>
                    </div>
                    {event.rsvp_required && (
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>出欠確認あり (締切: {event.rsvp_deadline ? new Date(event.rsvp_deadline).toLocaleDateString() : 'なし'})</p>
                      </div>
                    )}
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
