
'use client'

import { useState } from 'react'
import { createRole, updateRole } from '@/app/admin/actions/officer'
import Link from 'next/link'

type Props = {
  role?: {
    id: string
    name: string
    display_order: number // or string, depending on DB type, usually number
    description: string | null
    can_edit_members: boolean
    is_visible_in_docs?: boolean | null
    is_audit?: boolean | null
    is_accounting?: boolean | null
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

      <div className="relative flex gap-x-3">
        <div className="flex h-6 items-center">
          <input
            id="can_edit_members"
            name="can_edit_members"
            type="checkbox"
            defaultChecked={role?.can_edit_members}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
          />
        </div>
        <div className="text-sm leading-6">
          <label htmlFor="can_edit_members" className="font-medium text-gray-900">
            会員情報の編集権限
          </label>
          <p className="text-gray-500">この役職の担当者は、会員名簿の情報を編集できるようになります。</p>
        </div>
      </div>

      <div className="relative flex gap-x-3">
        <div className="flex h-6 items-center">
          <input
            id="is_visible_in_docs"
            name="is_visible_in_docs"
            type="checkbox"
            defaultChecked={role?.is_visible_in_docs ?? true}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
          />
        </div>
        <div className="text-sm leading-6">
          <label htmlFor="is_visible_in_docs" className="font-medium text-gray-900">
            資料・名簿への表示
          </label>
          <p className="text-gray-500">チェックを入れると、役員名簿などの資料にこの役職が表示されます。</p>
        </div>
      </div>

      <div className="relative flex gap-x-3">
        <div className="flex h-6 items-center">
          <input
            id="is_accounting"
            name="is_accounting"
            type="checkbox"
            defaultChecked={role?.is_accounting ?? false}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
          />
        </div>
        <div className="text-sm leading-6">
          <label htmlFor="is_accounting" className="font-medium text-gray-900">
            会計担当
          </label>
          <p className="text-gray-500">この役職の担当者は、会計報告書の「会計担当者」欄に自動的に表示されます。</p>
        </div>
      </div>

      <div className="relative flex gap-x-3">
        <div className="flex h-6 items-center">
          <input
            id="is_audit"
            name="is_audit"
            type="checkbox"
            defaultChecked={role?.is_audit ?? false}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
          />
        </div>
        <div className="text-sm leading-6">
          <label htmlFor="is_audit" className="font-medium text-gray-900">
            会計監査の署名
          </label>
          <p className="text-gray-500">この役職は、会計報告書に署名（チェック）を入れることができます。</p>
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
