'use client'

import { useState } from 'react'
import { createRole, updateRole } from '@/app/admin/actions/officer'
import Link from 'next/link'
import { Input } from '@/ui/primitives/Input'
import { Box } from '@/ui/layout/Box'
import { Stack, HStack } from '@/ui/layout/Stack'
import { Text } from '@/ui/primitives/Text'
import { Button } from '@/ui/primitives/Button'
import { Label } from '@/ui/primitives/Label'
import { Save, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  role?: {
    id: string
    name: string
    display_order: number
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
    <form action={handleSubmit}>
      <Stack className="gap-6">
        {message && (
          <Box className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle size={18} />
            <Text weight="bold" className="text-sm">{message}</Text>
          </Box>
        )}

        <Box className="grid grid-cols-1 gap-6 sm:grid-cols-6">
          <Box className="sm:col-span-4">
            <Label htmlFor="name" className="mb-1.5 block">
              役職名 <Text className="text-destructive">*</Text>
            </Label>
            <Input
              type="text"
              name="name"
              id="name"
              required
              defaultValue={role?.name || ''}
              placeholder="例: 会長、会計"
            />
          </Box>

          <Box className="sm:col-span-2">
            <Label htmlFor="display_order" className="mb-1.5 block">
              表示順
            </Label>
            <Input
              type="number"
              name="display_order"
              id="display_order"
              defaultValue={role?.display_order || initialDisplayOrder}
              className="w-full"
            />
            <Text className="mt-1.5 text-xs text-muted-foreground block">数字が小さいほど先に表示されます。</Text>
          </Box>

          <Box className="sm:col-span-6">
            <Label htmlFor="description" className="mb-1.5 block">
              説明
            </Label>
            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={role?.description || ''}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="役職の職務内容などを入力してください"
            />
          </Box>
        </Box>

        <Stack className="gap-4 py-2">
          <HStack className="items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer" asChild>
            <label htmlFor="can_edit_members">
              <input
                id="can_edit_members"
                name="can_edit_members"
                type="checkbox"
                defaultChecked={role?.can_edit_members}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Stack className="gap-0.5">
                <Text weight="bold" className="text-sm">会員情報の編集権限</Text>
                <Text className="text-xs text-muted-foreground">この役職の担当者は、会員名簿の情報を編集できるようになります。</Text>
              </Stack>
            </label>
          </HStack>

          <HStack className="items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer" asChild>
            <label htmlFor="is_visible_in_docs">
              <input
                id="is_visible_in_docs"
                name="is_visible_in_docs"
                type="checkbox"
                defaultChecked={role?.is_visible_in_docs ?? true}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Stack className="gap-0.5">
                <Text weight="bold" className="text-sm">資料・名簿への表示</Text>
                <Text className="text-xs text-muted-foreground">役員名簿などの対外・内部資料にこの役職を表示します。</Text>
              </Stack>
            </label>
          </HStack>

          <HStack className="items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer" asChild>
            <label htmlFor="is_accounting">
              <input
                id="is_accounting"
                name="is_accounting"
                type="checkbox"
                defaultChecked={role?.is_accounting ?? false}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Stack className="gap-0.5">
                <Text weight="bold" className="text-sm">会計担当</Text>
                <Text className="text-xs text-muted-foreground">会計報告書の「会計担当者」欄に氏名が自動的に反映されます。</Text>
              </Stack>
            </label>
          </HStack>

          <HStack className="items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer" asChild>
            <label htmlFor="is_audit">
              <input
                id="is_audit"
                name="is_audit"
                type="checkbox"
                defaultChecked={role?.is_audit ?? false}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Stack className="gap-0.5">
                <Text weight="bold" className="text-sm">会計監査の署名権限</Text>
                <Text className="text-xs text-muted-foreground">会計報告書の監査照合および署名を行うことができます。</Text>
              </Stack>
            </label>
          </HStack>
        </Stack>

        <HStack className="justify-end gap-3 pt-6 border-t border-border mt-4">
          <Button variant="outline" asChild>
            <Link href="/admin/roles">
              キャンセル
            </Link>
          </Button>
          <Button type="submit" activeScale={true} className="gap-2 px-8 h-10 font-bold shadow-md">
            <Save size={16} />
            {role ? '更新する' : '作成する'}
          </Button>
        </HStack>
      </Stack>
    </form>
  )
}
