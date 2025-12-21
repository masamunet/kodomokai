'use client'

import { useState } from 'react'
import { updateProfile } from '../actions/profile'
import { Box } from '@/ui/layout/Box'
import { Stack, HStack } from '@/ui/layout/Stack'
import { Text } from '@/ui/primitives/Text'
import { Input } from '@/ui/primitives/Input'
import { Label } from '@/ui/primitives/Label'
import { Button } from '@/ui/primitives/Button'
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react'

type Props = {
  profile: any
}

export default function ProfileForm({ profile }: Props) {
  const [message, setMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setMessage(null)
    const result = await updateProfile(formData)

    if (result) {
      setMessage(result.message)
      setIsSuccess(result.success)
      if (result.success) {
        setTimeout(() => setMessage(null), 3000)
      }
    }
  }

  return (
    <form action={handleSubmit}>
      <Stack className="gap-6">
        {message && (
          <HStack
            className={
              `p-4 rounded-lg border gap-3 ${!isSuccess
                ? 'bg-destructive/10 border-destructive/20 text-destructive'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`
            }
          >
            {!isSuccess ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <Text weight="bold" className="text-sm">
              {message}
            </Text>
          </HStack>
        )}

        <Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Box className="space-y-2">
            <Label>お名前 <Text className="text-destructive">*</Text></Label>
            <HStack className="gap-2">
              <Input type="text" name="last_name" placeholder="苗字" defaultValue={profile?.last_name || ''} required />
              <Input type="text" name="first_name" placeholder="名前" defaultValue={profile?.first_name || ''} required />
            </HStack>
          </Box>

          <Box className="space-y-2">
            <Label>ふりがな</Label>
            <HStack className="gap-2">
              <Input type="text" name="last_name_kana" placeholder="みょうじ" defaultValue={profile?.last_name_kana || ''} />
              <Input type="text" name="first_name_kana" placeholder="なまえ" defaultValue={profile?.first_name_kana || ''} />
            </HStack>
          </Box>

          <Box className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input type="email" name="email" id="email" defaultValue={profile?.email || ''} disabled />
          </Box>

          <Box className="space-y-2">
            <Label htmlFor="phone">電話番号</Label>
            <Input type="tel" name="phone" id="phone" defaultValue={profile?.phone || ''} />
          </Box>

          <Box className="md:col-span-2 space-y-2">
            <Label htmlFor="address">住所</Label>
            <Input type="text" name="address" id="address" defaultValue={profile?.address || ''} />
          </Box>
        </Box>

        <HStack className="justify-end pt-4">
          <Button type="submit" activeScale={true} className="gap-2 px-8 h-11 font-bold shadow-md">
            <Save size={18} />
            保存する
          </Button>
        </HStack>
      </Stack>
    </form>
  )
}
