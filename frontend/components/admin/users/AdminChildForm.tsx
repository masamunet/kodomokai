'use client'

import { useState } from 'react'
import { adminAddChild, adminUpdateChild } from '@/app/admin/actions/user'
import Link from 'next/link'
import { Input } from '@/ui/primitives/Input'
import { Box } from '@/ui/layout/Box'
import { Stack, HStack } from '@/ui/layout/Stack'
import { Text } from '@/ui/primitives/Text'
import { Button } from '@/ui/primitives/Button'
import { Label } from '@/ui/primitives/Label'
import { Save, AlertCircle } from 'lucide-react'

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
    <form action={handleSubmit}>
      <input type="hidden" name="parent_id" value={parentId} />
      {child && <input type="hidden" name="child_id" value={child.id} />}

      <Stack className="gap-6">
        {message && (
          <Box className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle size={18} />
            <Text weight="bold" className="text-sm">{message}</Text>
          </Box>
        )}

        <Box className="grid grid-cols-1 gap-6 sm:grid-cols-6">
          <Box className="sm:col-span-3">
            <Label className="mb-1.5 block">お名前 <Text className="text-destructive">*</Text></Label>
            <HStack className="gap-2">
              <Box className="flex-1">
                <Input type="text" name="last_name" placeholder="苗字" defaultValue={child?.last_name || ''} required />
              </Box>
              <Box className="flex-1">
                <Input type="text" name="first_name" placeholder="名前" defaultValue={child?.first_name || ''} required />
              </Box>
            </HStack>
          </Box>

          <Box className="sm:col-span-3">
            <Label className="mb-1.5 block">ふりがな</Label>
            <HStack className="gap-2">
              <Box className="flex-1">
                <Input type="text" name="last_name_kana" placeholder="みょうじ" defaultValue={child?.last_name_kana || ''} />
              </Box>
              <Box className="flex-1">
                <Input type="text" name="first_name_kana" placeholder="なまえ" defaultValue={child?.first_name_kana || ''} />
              </Box>
            </HStack>
          </Box>

          <Box className="sm:col-span-3">
            <Label htmlFor="gender" className="mb-1.5 block">性別</Label>
            <select
              id="gender"
              name="gender"
              defaultValue={child?.gender || 'male'}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="male">男の子</option>
              <option value="female">女の子</option>
              <option value="other">その他</option>
            </select>
          </Box>

          <Box className="sm:col-span-3">
            <Label htmlFor="birthday" className="mb-1.5 block">生年月日</Label>
            <Input type="date" name="birthday" id="birthday" defaultValue={child?.birthday || ''} />
          </Box>

          <Box className="sm:col-span-6">
            <Label htmlFor="allergies" className="mb-1.5 block">アレルギー</Label>
            <Input type="text" name="allergies" id="allergies" defaultValue={child?.allergies || ''} placeholder="なし" />
          </Box>

          <Box className="sm:col-span-6">
            <Label htmlFor="notes" className="mb-1.5 block">特記事項</Label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              defaultValue={child?.notes || ''}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="例：喘息あり、離乳食開始済みなど"
            />
          </Box>
        </Box>

        <HStack className="justify-end gap-3 pt-6 border-t border-border mt-4">
          <Button variant="outline" asChild>
            <Link href={`/admin/users/${parentId}`}>
              キャンセル
            </Link>
          </Button>
          <Button type="submit" activeScale={true} className="gap-2 px-8 h-10 font-bold shadow-md">
            <Save size={16} />
            {child ? '更新する' : '追加する'}
          </Button>
        </HStack>
      </Stack>
    </form>
  )
}
