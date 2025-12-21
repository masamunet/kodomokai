'use client'

import { adminDeleteChild, adminDeleteAllChildrenFromParent } from '@/app/admin/actions/user'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { calculateGrade, getGradeOrder } from '@/lib/grade-utils'
import { Box } from '@/ui/layout/Box'
import { Stack, HStack } from '@/ui/layout/Stack'
import { Text } from '@/ui/primitives/Text'
import { Button } from '@/ui/primitives/Button'
import { ClickableTableRow } from '@/components/admin/patterns/ClickableTableRow'
import { Trash2, Edit2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

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
        {message && <Text className="text-xs text-destructive mr-2">{message}</Text>}
        <Button
          type="submit"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          title="削除"
        >
          <Trash2 size={16} />
        </Button>
      </form>
    )
  }

  if (!childrenData || childrenData.length === 0) {
    return (
      <Box className="p-8 text-center bg-muted/10 rounded-lg border border-dashed border-border">
        <Text className="text-muted-foreground">登録されているお子様はいません。</Text>
      </Box>
    )
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
    <Stack className="gap-4">
      <HStack className="justify-end px-1">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDeleteAll}
          className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive text-xs h-8"
        >
          登録されている子供を全員削除
        </Button>
      </HStack>
      <Box className="overflow-x-auto rounded-lg border border-border shadow-sm">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-bold text-muted-foreground uppercase tracking-wider">学年</th>
              <th className="px-4 py-3 text-left font-bold text-muted-foreground uppercase tracking-wider">氏名</th>
              <th className="px-4 py-3 text-left font-bold text-muted-foreground uppercase tracking-wider">生年月日 / 性別</th>
              <th className="px-4 py-3 text-left font-bold text-muted-foreground uppercase tracking-wider">アレルギー / 備考</th>
              <th className="px-4 py-3 text-right font-bold text-muted-foreground uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {childrenData.map((child) => {
              const grade = calculateGrade(child.birthday, targetFiscalYear)
              const isEven = getGradeOrder(grade) % 2 === 0

              return (
                <ClickableTableRow
                  key={child.id}
                  href={`/admin/users/${parentId}/children/${child.id}`}
                  className={cn(
                    "transition-colors",
                    isEven ? 'bg-card' : 'bg-muted/20'
                  )}
                >
                  <td className="px-4 py-4 whitespace-nowrap font-bold text-foreground">{grade}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <Stack className="gap-0.5">
                      <Text weight="bold">{child.full_name}</Text>
                      <Text className="text-xs text-muted-foreground">({child.last_name_kana} {child.first_name_kana})</Text>
                    </Stack>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-muted-foreground">
                    <Text className="text-sm">
                      {child.birthday ? new Date(child.birthday).toLocaleDateString() : '-'}
                      {' / '}
                      {child.gender === 'male' ? '男' : child.gender === 'female' ? '女' : '他'}
                    </Text>
                  </td>
                  <td className="px-4 py-4">
                    <Stack className="gap-1">
                      {child.allergies && (
                        <Text className="text-destructive font-bold flex items-center gap-1 text-xs" title={child.allergies}>
                          <AlertCircle size={14} /> {child.allergies}
                        </Text>
                      )}
                      {child.notes && (
                        <Text className="text-xs text-muted-foreground line-clamp-1" title={child.notes}>
                          {child.notes}
                        </Text>
                      )}
                    </Stack>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <HStack className="justify-end items-center gap-2">
                      <Box className="p-1 h-8 w-8 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                        <Edit2 size={16} />
                      </Box>
                      <DeleteButton childId={child.id} />
                    </HStack>
                  </td>
                </ClickableTableRow>
              )
            })}
          </tbody>
        </table>
      </Box>
    </Stack>
  )
}
