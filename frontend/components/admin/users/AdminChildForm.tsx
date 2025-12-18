'use client'

import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { adminAddChild, adminUpdateChild } from '@/app/admin/actions/user'
import Link from 'next/link'

type Props = {
  parentId: string
  child?: any
}

export default function AdminChildForm({ parentId, child }: Props) {
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setMessage(null)

    let result;
    if (child) {
      result = await adminUpdateChild(formData)
    } else {
      result = await adminAddChild(formData)
    }

    if (result && !result.success) {
      setMessage(result.message)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6 bg-white p-6 shadow sm:rounded-md mt-6">
      <input type="hidden" name="parent_id" value={parentId} />
      {child && <input type="hidden" name="child_id" value={child.id} />}

      {message && (
        <div className="bg-red-50 border-red-200 text-red-700 px-4 py-3 rounded border">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <label className="block text-sm font-medium text-gray-700">お名前 <span className="text-red-500">*</span></label>
          <div className="mt-1 flex gap-2">
            <div className="w-1/2">
              <Input type="text" name="last_name" placeholder="苗字" defaultValue={child?.last_name || ''} required />
            </div>
            <div className="w-1/2">
              <Input type="text" name="first_name" placeholder="名前" defaultValue={child?.first_name || ''} required />
            </div>
          </div>
        </div>

        <div className="sm:col-span-3">
          <label className="block text-sm font-medium text-gray-700">ふりがな</label>
          <div className="mt-1 flex gap-2">
            <div className="w-1/2">
              <Input type="text" name="last_name_kana" placeholder="みょうじ" defaultValue={child?.last_name_kana || ''} />
            </div>
            <div className="w-1/2">
              <Input type="text" name="first_name_kana" placeholder="なまえ" defaultValue={child?.first_name_kana || ''} />
            </div>
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700">性別</label>
          <div className="mt-1">
            <select
              id="gender"
              name="gender"
              defaultValue={child?.gender || 'male'}
              className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
            >
              <option value="male">男の子</option>
              <option value="female">女の子</option>
              <option value="other">その他</option>
            </select>
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="birthday" className="block text-sm font-medium text-gray-700">生年月日</label>
          <div className="mt-1">
            <Input type="date" name="birthday" id="birthday" defaultValue={child?.birthday || ''} />
          </div>
        </div>

        <div className="sm:col-span-6">
          <label htmlFor="allergies" className="block text-sm font-medium text-gray-700">アレルギー</label>
          <div className="mt-1">
            <Input type="text" name="allergies" id="allergies" defaultValue={child?.allergies || ''} placeholder="なし" />
          </div>
        </div>

        <div className="sm:col-span-6">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">特記事項</label>
          <div className="mt-1">
            <textarea
              id="notes"
              name="notes"
              rows={3}
              defaultValue={child?.notes || ''}
              className="block w-full rounded-md border-0 py-1.5 p-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Link href={`/admin/users/${parentId}`} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
          キャンセル
        </Link>
        <button type="submit" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
          {child ? '更新する' : '追加する'}
        </button>
      </div>
    </form>
  )
}
