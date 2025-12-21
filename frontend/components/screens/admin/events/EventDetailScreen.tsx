import Link from 'next/link'
import PrintButton from '@/components/admin/PrintButton'
import { Box } from '@/ui/layout/Box'
import { Stack } from '@/ui/layout/Stack'
import { Heading } from '@/ui/primitives/Heading'
import { Text } from '@/ui/primitives/Text'

interface EventDetailScreenProps {
  id: string
  event: any
  participants: any[]
  attendingParticipants: any[]
  attendingCount: number
}

export function EventDetailScreen({
  id,
  event,
  participants,
  attendingParticipants,
  attendingCount
}: EventDetailScreenProps) {
  return (
    <Box className="print:p-8">
      {/* Screen View */}
      <Box className="print:hidden">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/events" className="text-gray-500 hover:text-gray-700">← 戻る</Link>
            <Heading size="h2" className="text-xl font-semibold">{event.title}</Heading>
          </div>
          <div className="flex gap-2">
            <PrintButton label="参加者名簿を印刷" />
            <Link href={`/admin/events/${id}/edit`} className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">編集</Link>
          </div>
        </div>

        <Box className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <Text weight="bold" className="text-base leading-6 text-gray-900">イベント詳細</Text>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">日時</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {event.is_tentative ? (
                    <Text weight="bold" className="text-amber-600">日付未定</Text>
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
        </Box>

        <Box className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <Text weight="bold" className="text-base leading-6 text-gray-900">参加者一覧（子供）</Text>
            <div className="flex gap-4 text-sm">
              <Text weight="medium" className="text-green-700">参加予定: {attendingCount}名</Text>
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
                          <Text weight="bold" className="text-gray-900 text-lg">
                            {participant.childName} <Text className="text-xs font-normal text-gray-500">さん</Text>
                          </Text>
                          {participant.grade && (
                            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                              {participant.grade}
                            </span>
                          )}
                        </div>
                        <Text className="text-sm text-gray-500">
                          保護者: {participant.profile?.full_name || '名前なし'} ({participant.profile?.email})
                        </Text>
                      </div>
                      <Box>
                        {participant.status === 'declined' && (
                          <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">欠席</span>
                        )}
                        {participant.status === 'maybe' && (
                          <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">未定</span>
                        )}
                      </Box>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </Box>
      </Box>

      {/* Print View Table */}
      <Box className="hidden print:block">
        <Heading size="h1" className="text-2xl font-bold mb-2 text-center">{event.title} 参加者名簿</Heading>
        <Text className="block text-right text-sm mb-4">開催日: {event.is_tentative ? '未定' : new Date(event.scheduled_date).toLocaleDateString()}</Text>

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
        <Box className="mt-4 text-right font-bold">
          合計: {attendingCount} 名
        </Box>
      </Box>
    </Box>
  )
}
