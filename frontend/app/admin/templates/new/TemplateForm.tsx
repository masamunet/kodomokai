
'use client'

import { useState } from 'react'
import { createTemplate } from '../../actions/template'
import Link from 'next/link'

export default function TemplateForm() {
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setMessage(null)
    const result = await createTemplate(formData)

    if (result && !result.success) {
      setMessage(result.message)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6 bg-white p-6 shadow sm:rounded-md">
      {message && (
        <div className="bg-red-50 border-red-200 text-red-700 px-4 py-3 rounded border">
          {message}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
          テンプレート名
        </label>
        <div className="mt-2">
          <input
            type="text"
            name="name"
            id="name"
            required
            placeholder="例: 定例会のお知らせ"
            className="block w-full rounded-md border-0 py-1.5 p-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium leading-6 text-gray-900">
          件名
        </label>
        <div className="mt-2">
          <input
            type="text"
            name="subject"
            id="subject"
            required
            placeholder="例: 【重要】4月定例会のお知らせ"
            className="block w-full rounded-md border-0 py-1.5 p-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div>
        <label htmlFor="body" className="block text-sm font-medium leading-6 text-gray-900">
          本文
        </label>
        <div className="mt-2">
          <textarea
            id="body"
            name="body"
            rows={10}
            required
            className="block w-full rounded-md border-0 py-1.5 p-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Link href="/admin/templates" className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
          キャンセル
        </Link>
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          作成する
        </button>
      </div>
    </form>
  )
}
