
'use client'

import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { addChild } from '../../../actions/profile'
import Link from 'next/link'

export default function ChildForm() {
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setMessage(null)
    const result = await addChild(formData)

    if (result && !result.success) {
      setMessage(result.message)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {message && (
        <div className="bg-red-50 border-red-200 text-red-700 px-4 py-3 rounded border">
          {message}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium leading-6 text-gray-900">
          お名前 <span className="text-red-500">*</span>
        </label>
        <div className="mt-2 flex gap-2">
          <div className="w-1/2">
            <Input
              type="text"
              name="last_name"
              required
              placeholder="苗字"
            />
          </div>
          <div className="w-1/2">
            <Input
              type="text"
              name="first_name"
              required
              placeholder="名前"
            />
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium leading-6 text-gray-900">
          ふりがな
        </label>
        <div className="mt-2 flex gap-2">
          <div className="w-1/2">
            <Input
              type="text"
              name="last_name_kana"
              placeholder="みょうじ"
            />
          </div>
          <div className="w-1/2">
            <Input
              type="text"
              name="first_name_kana"
              placeholder="なまえ"
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="gender" className="block text-sm font-medium leading-6 text-gray-900">
          性別
        </label>
        <div className="mt-2">
          <select
            id="gender"
            name="gender"
            className="block w-full rounded-md border-0 py-1.5 p-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          >
            <option value="male">男の子</option>
            <option value="female">女の子</option>
            <option value="other">その他</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="birthday" className="block text-sm font-medium leading-6 text-gray-900">
          誕生日
        </label>
        <div className="mt-2">
          <input
            type="date"
            name="birthday"
            id="birthday"
            className="block w-full rounded-md border-0 py-1.5 p-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div>
        <label htmlFor="allergies" className="block text-sm font-medium leading-6 text-gray-900">
          アレルギー
        </label>
        <div className="mt-2">
          <textarea
            id="allergies"
            name="allergies"
            rows={2}
            className="block w-full rounded-md border-0 py-1.5 p-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="ない場合は空欄で構いません"
          />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium leading-6 text-gray-900">
          その他備考
        </label>
        <div className="mt-2">
          <textarea
            id="notes"
            name="notes"
            rows={2}
            className="block w-full rounded-md border-0 py-1.5 p-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Link href="/profile" className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
          キャンセル
        </Link>
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          登録する
        </button>
      </div>
    </form>
  )
}
