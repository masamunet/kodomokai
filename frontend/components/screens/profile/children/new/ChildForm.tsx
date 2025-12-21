'use client'

import { useState } from 'react'
import { addChild } from '@/app/actions/profile'
import Link from 'next/link'
import { Box } from '@/ui/layout/Box'
import { Stack, HStack } from '@/ui/layout/Stack'
import { Text } from '@/ui/primitives/Text'
import { Input } from '@/ui/primitives/Input'
import { Label } from '@/ui/primitives/Label'
import { Button } from '@/ui/primitives/Button'
import { Save, X, AlertCircle } from 'lucide-react'

export default function ChildForm({
  initialLastName,
  initialLastNameKana
}: {
  initialLastName?: string
  initialLastNameKana?: string
}) {
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setMessage(null)
    const result = await addChild(formData)

    if (result && !result.success) {
      setMessage(result.message)
    }
  }

  return (
    <form action={handleSubmit}>
      <Stack className="gap-6">
        {message && (
          <HStack className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg gap-3">
            <AlertCircle size={18} />
            <Text weight="bold" className="text-sm">
              {message}
            </Text>
          </HStack>
        )}

        <Box className="space-y-4">
          <Box className="space-y-2">
            <Label>お名前 <Text className="text-destructive">*</Text></Label>
            <HStack className="gap-2">
              <Input
                type="text"
                name="last_name"
                required
                placeholder="苗字"
                defaultValue={initialLastName}
              />
              <Input
                type="text"
                name="first_name"
                required
                placeholder="名前"
              />
            </HStack>
          </Box>

          <Box className="space-y-2">
            <Label>ふりがな</Label>
            <HStack className="gap-2">
              <Input
                type="text"
                name="last_name_kana"
                placeholder="みょうじ"
                defaultValue={initialLastNameKana}
              />
              <Input
                type="text"
                name="first_name_kana"
                placeholder="なまえ"
              />
            </HStack>
          </Box>

          <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Box className="space-y-2">
              <Label htmlFor="gender">性別</Label>
              <select
                id="gender"
                name="gender"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="male">男の子</option>
                <option value="female">女の子</option>
                <option value="other">その他</option>
              </select>
            </Box>

            <Box className="space-y-2">
              <Label htmlFor="birthday">誕生日</Label>
              <Input
                type="date"
                name="birthday"
                id="birthday"
              />
            </Box>
          </Box>

          <Box className="space-y-2">
            <Label htmlFor="allergies">アレルギー</Label>
            <textarea
              id="allergies"
              name="allergies"
              rows={2}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="ない場合は空欄で構いません"
            />
          </Box>

          <Box className="space-y-2">
            <Label htmlFor="notes">その他備考</Label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </Box>
        </Box>

        <HStack className="justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" asChild>
            <Link href="/profile" className="gap-2">
              <X size={16} />
              キャンセル
            </Link>
          </Button>
          <Button
            type="submit"
            activeScale={true}
            className="gap-2 px-8 h-10 font-bold shadow-md"
          >
            <Save size={16} />
            登録する
          </Button>
        </HStack>
      </Stack>
    </form>
  )
}
