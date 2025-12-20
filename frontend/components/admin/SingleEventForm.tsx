'use client'

import { useState } from 'react'
import { createEvent, updateEvent } from '@/app/admin/actions/event'
import Link from 'next/link'

type Event = {
  id: string
  title: string
  description: string | null
  scheduled_date: string // YYYY-MM-DD
  start_time: string | null // HH:mm:ss
  scheduled_end_date: string | null // YYYY-MM-DD
  location: string | null
  type: string
  rsvp_required: boolean
  rsvp_deadline: string | null // ISO String or YYYY-MM-DDTHH:mm:ss
  public_status: string
  is_canceled: boolean
}

export default function SingleEventForm({ event }: { event?: Event }) {
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setMessage(null)
    const action = event ? updateEvent : createEvent
    const result = await action(formData)

    if (result && !result.success) {
      setMessage(result.message)
    }
  }

  // Initial values helper
  const getInitialStartDateTime = () => {
    if (!event) return ''
    // scheduled_date (YYYY-MM-DD) + start_time (HH:mm:ss)
    const date = event.scheduled_date
    const time = event.start_time ? event.start_time.slice(0, 5) : '00:00'
    return `${date}T${time}`
  }

  const getInitialEndDateTime = () => {
    if (!event || !event.scheduled_end_date) return ''
    // scheduled_end_date (YYYY-MM-DD) + assuming end of day or same time?
    // DB only stores date for end. Form uses datetime-local.
    // Let's just use 00:00 or current logic
    return `${event.scheduled_end_date}T00:00`
  }

  const getInitialRsvpDeadline = () => {
    if (!event || !event.rsvp_deadline) return ''
    return new Date(event.rsvp_deadline).toISOString().slice(0, 16)
  }

  return (
    <form action={handleSubmit} className="space-y-6 bg-white p-6 shadow sm:rounded-md">
      {message && (
        <div className="bg-red-50 border-red-200 text-red-700 px-4 py-3 rounded border">
          {message}
        </div>
      )}

      {/* Hidden ID for update */}
      {event && <input type="hidden" name="id" value={event.id} />}

      <div>
        <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">
          イベント名
        </label>
        <div className="mt-2">
          <input
            type="text"
            name="title"
            id="title"
            required
            defaultValue={event?.title}
            className="block w-full rounded-md border-0 py-1.5 p-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
          説明
        </label>
        <div className="mt-2">
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={event?.description || ''}
            className="block w-full rounded-md border-0 py-1.5 p-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="start_time" className="block text-sm font-medium leading-6 text-gray-900">
            開始日時
          </label>
          <div className="mt-2">
            <input
              type="datetime-local"
              name="start_time"
              id="start_time"
              required
              defaultValue={getInitialStartDateTime()}
              className="block w-full rounded-md border-0 py-1.5 p-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
        <div>
          <label htmlFor="end_time" className="block text-sm font-medium leading-6 text-gray-900">
            終了日時 (日付のみ保存されます)
          </label>
          <div className="mt-2">
            <input
              type="datetime-local"
              name="end_time"
              id="end_time"
              defaultValue={getInitialEndDateTime()}
              className="block w-full rounded-md border-0 py-1.5 p-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium leading-6 text-gray-900">
          開催場所
        </label>
        <div className="mt-2">
          <input
            type="text"
            name="location"
            id="location"
            defaultValue={event?.location || ''}
            className="block w-full rounded-md border-0 py-1.5 p-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium leading-6 text-gray-900">
          種類
        </label>
        <div className="mt-2">
          <select
            id="type"
            name="type"
            defaultValue={event?.type || 'recreation'}
            className="block w-full rounded-md border-0 py-1.5 p-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          >
            <option value="meeting">会議</option>
            <option value="recreation">レクリエーション</option>
            <option value="other">その他</option>
          </select>
        </div>
      </div>

      <div className="relative flex gap-x-3">
        <div className="flex h-6 items-center">
          <input
            id="rsvp_required"
            name="rsvp_required"
            type="checkbox"
            defaultChecked={event?.rsvp_required || false}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
          />
        </div>
        <div className="text-sm leading-6">
          <label htmlFor="rsvp_required" className="font-medium text-gray-900">
            出欠確認を行う
          </label>
          <p className="text-gray-500">チェックを入れると、会員に出欠登録を求めます。</p>
        </div>
      </div>

      <div>
        <label htmlFor="rsvp_deadline" className="block text-sm font-medium leading-6 text-gray-900">
          出欠締め切り
        </label>
        <div className="mt-2">
          <input
            type="datetime-local"
            name="rsvp_deadline"
            id="rsvp_deadline"
            defaultValue={getInitialRsvpDeadline()}
            className="block w-full rounded-md border-0 py-1.5 p-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
          公開ステータス
        </label>
        <div className="space-y-2">
          {[
            { value: 'draft', label: '下書き (役員のみに表示)' },
            { value: 'date_undecided', label: '告知・日時未定' },
            { value: 'details_undecided', label: '告知・日時決定・詳細未定' },
            { value: 'finalized', label: '告知・詳細決定' },
          ].map((status) => (
            <div key={status.value} className="flex items-center">
              <input
                id={`status-${status.value}`}
                name="public_status"
                type="radio"
                value={status.value}
                defaultChecked={event ? event.public_status === status.value : status.value === 'finalized'}
                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
              />
              <label htmlFor={`status-${status.value}`} className="ml-3 block text-sm leading-6 text-gray-900 cursor-pointer">
                {status.label}
              </label>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-500">
          「下書き」の間は、一般会員のダッシュボードや年間予定表には表示されません。
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Link href="/admin/events" className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
          キャンセル
        </Link>
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          {event ? '更新する' : '作成する'}
        </button>
      </div>
    </form>
  )
}
