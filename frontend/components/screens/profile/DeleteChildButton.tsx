'use client'

import { deleteChild } from '@/app/actions/profile'
import { useState } from 'react'
import { Button } from '@/ui/primitives/Button'
import { Text } from '@/ui/primitives/Text'
import { Trash2 } from 'lucide-react'
import { HStack } from '@/ui/layout/Stack'

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
      <HStack className="items-center gap-2">
        {message && <Text className="text-xs text-destructive">{message}</Text>}
        <Button
          type="submit"
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5"
        >
          <Trash2 size={14} />
          <Text className="text-sm font-bold">削除</Text>
        </Button>
      </HStack>
    </form>
  )
}
