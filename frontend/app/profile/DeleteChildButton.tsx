
'use client'

import { deleteChild } from '../actions/profile'
import { useState } from 'react'

export default function DeleteChildButton({ childId }: { childId: string }) {
  const [message, setMessage] = useState<string | null>(null)

  const handleDelete = async (formData: FormData) => {
    if (!confirm('本当に削除しますか？')) return

    const result = await deleteChild(formData)
    if (result && !result.success) {
      setMessage(result.message)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  return (
    <form action={handleDelete}>
      <input type="hidden" name="child_id" value={childId} />
      {message && <span className="text-xs text-red-500 mr-2">{message}</span>}
      <button type="submit" className="text-sm text-red-600 hover:text-red-900">削除</button>
    </form>
  )
}
