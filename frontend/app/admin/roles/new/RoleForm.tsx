
'use client'

import { useState } from 'react'
import { createRole, updateRole } from '../../actions/officer'
import Link from 'next/link'

type Props = {
  role?: {
    id: string
    name: string
    display_order: number // or string, depending on DB type, usually number
    description: string | null
  }
  initialDisplayOrder?: number
}

export default function RoleForm({ role, initialDisplayOrder = 1 }: Props) {
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setMessage(null)

    let result;
    if (role) {
      formData.append('id', role.id)
      result = await updateRole(formData)
    } else {
      result = await createRole(formData)
    }

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
          役職名
        </label>
        <div className="mt-2">
          <input
            type="text"
            name="name"
            id="name"
            required
            defaultValue={role?.name || ''}
            placeholder="例: 会長、会計"
            className="block w-full rounded-md border-0 py-1.5 p-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div>
        <label htmlFor="display_order" className="block text-sm font-medium leading-6 text-gray-900">
          表示順
        </label>
        <div className="mt-2">
          <input
            type="number"
            name="display_order"
            id="display_order"
            defaultValue={role?.display_order || initialDisplayOrder}
            className="block w-24 rounded-md border-0 py-1.5 p-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
          <p className="mt-1 text-sm text-gray-500">数字が小さいほど先に表示されます。</p>
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
            defaultValue={role?.description || ''}
            className="block w-full rounded-md border-0 py-1.5 p-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Link href="/admin/roles" className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
          キャンセル
        </Link>
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          {role ? '更新する' : '作成する'}
        </button>
      </div>
    </form>
  )
}
