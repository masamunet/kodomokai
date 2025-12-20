
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Get event details
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (!event) {
    return <div>イベントが見つかりません</div>
  }

  // Get participants
  const { data: participants } = await supabase
    .from('event_participants')
    .select(`
        *,
        profile:profiles(full_name, email)
    `)
    .eq('event_id', id)
    .order('created_at', { ascending: true })

  const attendingCount = participants?.filter(p => p.status === 'attending').length || 0
  const declinedCount = participants?.filter(p => p.status === 'declined').length || 0
  const maybeCount = participants?.filter(p => p.status === 'maybe').length || 0

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/events" className="text-gray-500 hover:text-gray-700">← 戻る</Link>
          <h2 className="text-xl font-semibold">{event.title}</h2>
        </div>
        <Link href={`/admin/events/${id}/edit`} className="text-indigo-600 hover:text-indigo-800">編集</Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-base font-semibold leading-6 text-gray-900">イベント詳細</h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">日時</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {new Date(event.start_time).toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-base font-semibold leading-6 text-gray-900">参加者一覧</h3>
          <div className="flex gap-4 text-sm">
            <span className="text-green-700 font-medium">出席: {attendingCount}</span>
            <span className="text-red-700 font-medium">欠席: {declinedCount}</span>
            <span className="text-yellow-700 font-medium">未定: {maybeCount}</span>
          </div>
        </div>
        <div className="border-t border-gray-200">
          <ul role="list" className="divide-y divide-gray-200">
            {participants?.length === 0 ? (
              <li className="px-4 py-4 sm:px-6 text-gray-500 text-center">回答はまだありません</li>
            ) : (
              participants?.map((participant) => {
                // Type assertion for joined data
                const profile = (participant as any).profile
                return (
                  <li key={participant.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="font-medium text-gray-900">{profile?.full_name || '名前なし'}</p>
                        <p className="ml-2 text-sm text-gray-500">{profile?.email}</p>
                      </div>
                      <div>
                        {participant.status === 'attending' && (
                          <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">出席</span>
                        )}
                        {participant.status === 'declined' && (
                          <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">欠席</span>
                        )}
                        {participant.status === 'maybe' && (
                          <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">未定</span>
                        )}
                      </div>
                    </div>
                  </li>
                )
              })
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
