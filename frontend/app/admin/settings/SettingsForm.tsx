
'use client'

import { useState } from 'react'
import { updateSettings } from '../actions/settings'

type Props = {
  initialName: string
  initialStartMonth: number
}

export default function SettingsForm({ initialName, initialStartMonth }: Props) {
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setMessage(null)
    const result = await updateSettings(formData)

    if (result?.success) {
      setMessage(result.message)
      setTimeout(() => setMessage(null), 3000)
    } else {
      setMessage(result?.message || 'エラーが発生しました')
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6 bg-white p-6 shadow sm:rounded-md">
      {message && (
        <div className={`border px-4 py-3 rounded ${message.includes('失敗') || message.includes('エラー') ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
          {message}
        </div>
      )}
      <div>
        <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
          会の名前
        </label>
        <div className="mt-2">
          <input
            type="text"
            name="name"
            id="name"
            defaultValue={initialName}
            required
            className="block w-full rounded-md border-0 py-1.5 p-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div>
        <label htmlFor="fiscal_year_start_month" className="block text-sm font-medium leading-6 text-gray-900">
          年度開始月
        </label>
        <p className="text-xs text-gray-500 mb-2">通常は4月です。</p>
        <div className="mt-2">
          <select
            id="fiscal_year_start_month"
            name="fiscal_year_start_month"
            defaultValue={initialStartMonth}
            className="block w-32 rounded-md border-0 py-1.5 p-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
              <option key={m} value={m}>{m}月</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          保存する
        </button>
      </div>
    </form>
  )
}
