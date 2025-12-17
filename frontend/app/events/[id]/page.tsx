
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { submitRsvp } from '../../actions/rsvp'

// Ensure we handle async params correctly for Next.js 15+ 
export default async function EventPage({
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

  // Get current user rsvp
  const { data: { user } } = await supabase.auth.getUser()
  let currentRsvp = null

  if (user) {
    const { data: participant } = await supabase
      .from('event_participants')
      .select('*')
      .eq('event_id', id)
      .eq('profile_id', user.id)
      .single()
    currentRsvp = participant
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4">
          <Link href="/" className="text-indigo-600 hover:text-indigo-500">
            ← ダッシュボードへ戻る
          </Link>
        </div>

        <div className="overflow-hidden bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-xl font-semibold leading-6 text-gray-900">{event.title}</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">{event.type === 'meeting' ? '定例会' : 'イベント'}</p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">日時</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(event.start_time).toLocaleDateString()} {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {event.end_time && ` 〜 ${new Date(event.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">場所</dt>
                <dd className="mt-1 text-sm text-gray-900">{event.location || '未定'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">詳細</dt>
                <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{event.description}</dd>
              </div>
            </dl>
          </div>

          {event.rsvp_required && (
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6 bg-gray-50">
              <h4 className="text-lg font-medium text-gray-900">出欠登録</h4>
              {event.rsvp_deadline && (
                <p className="text-sm text-red-600 mb-4">締切: {new Date(event.rsvp_deadline).toLocaleString()}</p>
              )}

              <form action={submitRsvp} className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                <input type="hidden" name="event_id" value={event.id} />

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="attending"
                      defaultChecked={currentRsvp?.status === 'attending'}
                      required
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                    <span className="text-gray-900">出席</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="declined"
                      defaultChecked={currentRsvp?.status === 'declined'}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                    <span className="text-gray-900">欠席</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="maybe"
                      defaultChecked={currentRsvp?.status === 'maybe'}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                    <span className="text-gray-900">未定</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  {currentRsvp ? '更新する' : '登録する'}
                </button>
              </form>
              {currentRsvp && (
                <p className="mt-2 text-sm text-green-700">
                  現在のステータス:
                  {currentRsvp.status === 'attending' && ' 出席'}
                  {currentRsvp.status === 'declined' && ' 欠席'}
                  {currentRsvp.status === 'maybe' && ' 未定'}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
