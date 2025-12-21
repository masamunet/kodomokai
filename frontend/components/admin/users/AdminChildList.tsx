'use client'

import { adminDeleteChild, adminDeleteAllChildrenFromParent } from '@/app/admin/actions/user'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { calculateGrade, getGradeOrder } from '@/lib/grade-utils'

type Props = {
  childrenData: any[]
  parentId: string
  targetFiscalYear: number
}

export default function AdminChildList({ childrenData, parentId, targetFiscalYear }: Props) {
  const router = useRouter()

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


  const handleDeleteAll = async () => {
    if (!confirm('この保護者に登録されているすべてのお子様を削除しますか？\nこの操作は取り消せません。')) return

    const formData = new FormData()
    formData.append('parent_id', parentId)
    const result = await adminDeleteAllChildrenFromParent(formData)
    if (!result.success) {
      alert(result.message)
    } else {
      router.refresh()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={handleDeleteAll}
          className="text-xs text-red-600 hover:text-red-900 bg-red-50 px-3 py-1.5 rounded border border-red-200 font-medium"
        >
          登録されている子供を全員削除
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">学年</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">氏名</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">生年月日 / 性別</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">アレルギー / 備考</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-900">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {childrenData.map((child) => {
              const grade = calculateGrade(child.birthday, targetFiscalYear)
              const isEven = getGradeOrder(grade) % 2 === 0

              return (
                <tr key={child.id} className={`hover:bg-gray-50/80 transition-colors ${isEven ? 'bg-white' : 'bg-indigo-50/30'}`}>
                  <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-900">{grade}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{child.full_name}</span>
                      <span className="text-xs text-gray-500">({child.last_name_kana} {child.first_name_kana})</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-gray-500">
                    {child.birthday ? new Date(child.birthday).toLocaleDateString() : '-'}
                    {' / '}
                    {child.gender === 'male' ? '男' : child.gender === 'female' ? '女' : '他'}
                  </td>
                  <td className="px-4 py-4 text-gray-500">
                    {child.allergies && (
                      <p className="text-red-500 font-medium mb-1 line-clamp-1" title={child.allergies}>⚠ {child.allergies}</p>
                    )}
                    {child.notes && (
                      <p className="text-xs line-clamp-1" title={child.notes}>{child.notes}</p>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end items-center gap-3">
                      <Link
                        href={`/admin/users/${parentId}/children/${child.id}`}
                        className="text-sm text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-2 py-1 rounded border border-indigo-100"
                      >
                        編集
                      </Link>
                      <DeleteButton childId={child.id} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
