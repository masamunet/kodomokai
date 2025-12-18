'use client'

import { adminDeleteChild } from '@/app/admin/actions/user'
import Link from 'next/link'
import { useState } from 'react'

type Props = {
  childrenData: any[]
  parentId: string
}

export default function AdminChildList({ childrenData, parentId }: Props) {

  // Internal delete button component to handle state per child
  const DeleteButton = ({ childId }: { childId: string }) => {
    const [message, setMessage] = useState<string | null>(null)

    const handleDelete = async (formData: FormData) => {
      if (!confirm('本当に削除しますか？')) return

      const result = await adminDeleteChild(formData)
      if (result && !result.success) {
        setMessage(result.message)
        setTimeout(() => setMessage(null), 3000)
      }
    }

    return (
      <form action={handleDelete}>
        <input type="hidden" name="child_id" value={childId} />
        <input type="hidden" name="parent_id" value={parentId} />
        {message && <span className="text-xs text-red-500 mr-2">{message}</span>}
        <button type="submit" className="text-sm text-red-600 hover:text-red-900 bg-red-50 px-2 py-1 rounded border border-red-100">削除</button>
      </form>
    )
  }

  if (!childrenData || childrenData.length === 0) {
    return <div className="p-4 text-center text-gray-500 bg-white rounded-md border border-gray-200">登録されているお子様はいません。</div>
  }

  return (
    <ul role="list" className="divide-y divide-gray-200 bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      {childrenData.map((child) => (
        <li key={child.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900">{child.full_name}</p>
                <Link
                  href={`/admin/users/${parentId}/children/${child.id}`}
                  className="text-indigo-600 hover:text-indigo-900 text-sm bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100"
                >
                  編集
                </Link>
              </div>
              <div className="mt-1 text-sm text-gray-500">
                {child.gender === 'male' ? '男' : child.gender === 'female' ? '女' : '他'}
                {' / '}
                {child.birthday ? new Date(child.birthday).toLocaleDateString() : '誕生日未登録'}
              </div>
              {child.allergies && (
                <p className="text-xs text-red-500 mt-1">アレルギー: {child.allergies}</p>
              )}
            </div>
            <DeleteButton childId={child.id} />
          </div>
        </li>
      ))}
    </ul>
  )
}
