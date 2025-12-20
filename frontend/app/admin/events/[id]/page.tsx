import { createClient } from '@/lib/supabase/server'
import { calculateGrade, getGradeOrder } from '@/lib/grade-utils'
import { getTargetFiscalYear } from '@/lib/fiscal-year'
import Link from 'next/link'
import PrintButton from '@/components/admin/PrintButton'

export default async function AdminEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const currentFiscalYear = await getTargetFiscalYear()

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
  const { data: participantsRaw } = await supabase
    .from('event_participants')
    .select(`
        *,
        profile:profiles(full_name, email, phone),
        child:children(full_name, last_name, first_name, birthday)
    `)
    .eq('event_id', id)
    .order('created_at', { ascending: true })

  // Process participants for display and printing
  const participants = (participantsRaw || []).map((p: any) => {
    const child = p.child
    const grade = child && child.birthday ? calculateGrade(child.birthday, currentFiscalYear) : ''
    const gradeOrder = getGradeOrder(grade)
    const childName = child ? `${child.last_name || ''} ${child.first_name || ''}`.trim() || child.full_name : '不明な子供'

    return {
      ...p,
      childName,
      grade,
      gradeOrder,
      profile: p.profile
    }
  })

  // Sort by Grade Order then Child Name
  participants.sort((a: any, b: any) => {
    if (a.gradeOrder !== b.gradeOrder) {
      return a.gradeOrder - b.gradeOrder
    }
    return a.childName.localeCompare(b.childName, 'ja')
  })

  const attendingParticipants = participants.filter((p: any) => p.status === 'attending')
  const attendingCount = attendingParticipants.length

  return (
    <div className="print:p-8">
      {/* Screen View */}
      <div className="print:hidden">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/events" className="text-gray-500 hover:text-gray-700">← 戻る</Link>
            <h2 className="text-xl font-semibold">{event.title}</h2>
          </div>
          <div className="flex gap-2">
            <PrintButton label="参加者名簿を印刷" />
            <Link href={`/admin/events/${id}/edit`} className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">編集</Link>
          </div>
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
                  {event.is_tentative ? (
                    <span className="text-amber-600 font-bold">日付未定</span>
                  ) : (
                    new Date(event.scheduled_date).toLocaleDateString() + (event.start_time ? ` ${event.start_time.slice(0, 5)}` : '')
                  )}
                </dd>
              </div>
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">場所</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {event.location || '未定'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h3 className="text-base font-semibold leading-6 text-gray-900">参加者一覧（子供）</h3>
            <div className="flex gap-4 text-sm">
              <span className="text-green-700 font-medium">参加予定: {attendingCount}名</span>
            </div>
          </div>
          <div className="border-t border-gray-200">
            <ul role="list" className="divide-y divide-gray-200">
              {participants.length === 0 ? (
                <li className="px-4 py-4 sm:px-6 text-gray-500 text-center">参加者はまだいません</li>
              ) : (
                participants.map((participant: any) => (
                  <li key={participant.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-lg">{participant.childName} <span className="text-xs font-normal text-gray-500">さん</span></span>
                          {participant.grade && <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">{participant.grade}</span>}
                        </div>
                        <p className="text-sm text-gray-500">保護者: {participant.profile?.full_name || '名前なし'} ({participant.profile?.email})</p>
                      </div>
                      <div>
                        {/* Status Badges Removed as per request */}
                        {participant.status === 'declined' && (
                          <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">欠席</span>
                        )}
                        {participant.status === 'maybe' && (
                          <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">未定</span>
                        )}
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Print View Table */}
      <div className="hidden print:block">
        <h1 className="text-2xl font-bold mb-2 text-center">{event.title} 参加者名簿</h1>
        <p className="text-right text-sm mb-4">開催日: {event.is_tentative ? '未定' : new Date(event.scheduled_date).toLocaleDateString()}</p>

        <table className="w-full text-left border-collapse border border-black">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black px-4 py-2 w-32">学年</th>
              <th className="border border-black px-4 py-2">氏名</th>
              <th className="border border-black px-4 py-2 w-48">保護者氏名</th>
              <th className="border border-black px-4 py-2 w-40">連絡先</th>
              <th className="border border-black px-4 py-2 w-24">チェック</th>
            </tr>
          </thead>
          <tbody>
            {attendingParticipants.length === 0 ? (
              <tr>
                <td colSpan={5} className="border border-black px-4 py-8 text-center text-gray-500">
                  参加予定者はいません
                </td>
              </tr>
            ) : (
              attendingParticipants.map((p: any) => (
                <tr key={p.id}>
                  <td className="border border-black px-4 py-2">{p.grade}</td>
                  <td className="border border-black px-4 py-2 font-bold">{p.childName}</td>
                  <td className="border border-black px-4 py-2 text-sm">{p.profile?.full_name}</td>
                  <td className="border border-black px-4 py-2 text-sm">{p.profile?.phone}</td>
                  <td className="border border-black px-4 py-2"></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="mt-4 text-right font-bold">
          合計: {attendingCount} 名
        </div>
      </div>
    </div>
  )
}
