
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

  // Get current user's children and their rsvp status
  const { data: { user } } = await supabase.auth.getUser()

  let children: any[] = []
  let participantMap: Record<string, any> = {}

  if (user) {
    // 1. Get children
    const { data: userChildren } = await supabase
      .from('children')
      .select('*')
      .eq('parent_id', user.id)
      .order('birthday', { ascending: false }) // Sort by age (youngest first usually bottom, but birthday descending means youngest first?) 
      // Usually older child first is better? birthday ascending -> older first
      .order('created_at', { ascending: true }) // fallback

    // Sort by birthday ascending (Oldest first)
    if (userChildren) {
      children = userChildren.sort((a, b) => (a.birthday > b.birthday ? 1 : -1))
    }

    // 2. Get existing participants records for these children
    if (children.length > 0) {
      const { data: participants } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', id)
        .eq('profile_id', user.id)
        .not('child_id', 'is', null)

      if (participants) {
        participants.forEach(p => {
          if (p.child_id) participantMap[p.child_id] = p
        })
      }
    }
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
                  {new Date(event.scheduled_date).toLocaleDateString()}
                  {event.start_time && ` ${event.start_time.slice(0, 5)}`}
                  {event.scheduled_end_date && ` 〜 ${new Date(event.scheduled_end_date).toLocaleDateString()}`}
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
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6 bg-indigo-50/50">
              <h4 className="text-lg font-bold text-indigo-900">出欠登録</h4>

              {children.length === 0 ? (
                <div className="mt-4 p-4 bg-yellow-50 rounded border border-yellow-200 text-yellow-800">
                  <p>お子様の情報が登録されていません。「マイページ」からお子様を登録してください。</p>
                  <Link href="/profile" className="text-indigo-600 underline mt-2 inline-block">マイページへ</Link>
                </div>
              ) : (
                <>
                  {event.rsvp_deadline && (
                    <p className="text-sm text-red-600 mb-4 mt-1">締切: {new Date(event.rsvp_deadline).toLocaleString()}</p>
                  )}

                  <form action={submitRsvp} className="mt-6 space-y-4">
                    <input type="hidden" name="event_id" value={event.id} />

                    <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
                      {children.map(child => {
                        const rsvp = participantMap[child.id]
                        const isAttending = rsvp?.status === 'attending'

                        return (
                          <div key={child.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <label htmlFor={`status_${child.id}`} className="flex items-center gap-4 cursor-pointer flex-1">
                              <input
                                type="checkbox"
                                id={`status_${child.id}`}
                                name={`status_${child.id}`}
                                value="attending"
                                defaultChecked={isAttending}
                                className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                              />
                              <div className="flex flex-col">
                                <span className="font-bold text-gray-900 text-lg">{child.full_name} <span className="text-sm font-normal text-gray-500">さん</span></span>
                                <span className="text-sm text-gray-500">
                                  参加する場合はチェック
                                </span>
                              </div>
                            </label>
                          </div>
                        )
                      })}
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button
                        type="submit"
                        className="w-full sm:w-auto inline-flex justify-center rounded-md bg-indigo-600 px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        保存する
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
