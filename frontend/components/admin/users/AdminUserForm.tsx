'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminUpdateProfile, adminDeleteProfile } from '@/app/admin/actions/user'
import { Input } from '@/ui/primitives/Input'
import { Box } from '@/ui/layout/Box'
import { Stack, HStack } from '@/ui/layout/Stack'
import { Text } from '@/ui/primitives/Text'
import { Button } from '@/ui/primitives/Button'
import { Label } from '@/ui/primitives/Label'
import { Save, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  profile: any
}

export default function AdminUserForm({ profile }: Props) {
  const [message, setMessage] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const isError = message?.includes('失敗') || message?.includes('エラー')

  const handleSubmit = async (formData: FormData) => {
    setMessage(null)
    const result = await adminUpdateProfile(formData)

    if (result) {
      setMessage(result.message)
      if (result.success) {
        setTimeout(() => setMessage(null), 3000)
      }
    }
  }

  return (
    <form action={handleSubmit}>
      <input type="hidden" name="id" value={profile.id} />

      <Stack className="gap-6">
        {message && (
          <Box className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg border shadow-sm transition-all animate-in fade-in slide-in-from-top-2",
            isError ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          )}>
            {isError ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <Text weight="bold" className="text-sm">{message}</Text>
          </Box>
        )}

        <Box className="grid grid-cols-1 gap-6 sm:grid-cols-6">
          <Box className="sm:col-span-3">
            <Label className="mb-1.5 block">お名前 <Text className="text-destructive">*</Text></Label>
            <HStack className="gap-2">
              <Box className="flex-1">
                <Input type="text" name="last_name" placeholder="苗字" defaultValue={profile?.last_name || ''} required />
              </Box>
              <Box className="flex-1">
                <Input type="text" name="first_name" placeholder="名前" defaultValue={profile?.first_name || ''} required />
              </Box>
            </HStack>
          </Box>

          <Box className="sm:col-span-3">
            <Label className="mb-1.5 block">ふりがな</Label>
            <HStack className="gap-2">
              <Box className="flex-1">
                <Input type="text" name="last_name_kana" placeholder="みょうじ" defaultValue={profile?.last_name_kana || ''} />
              </Box>
              <Box className="flex-1">
                <Input type="text" name="first_name_kana" placeholder="なまえ" defaultValue={profile?.first_name_kana || ''} />
              </Box>
            </HStack>
          </Box>

          <Box className="sm:col-span-3">
            <Label htmlFor="email" className="mb-1.5 block">メールアドレス</Label>
            <Box>
              <Input type="email" name="email" id="email" defaultValue={profile?.email || ''} readOnly className="bg-muted text-muted-foreground cursor-not-allowed" />
              <Text className="text-xs text-muted-foreground mt-1.5 block">メールアドレスの変更はできません。</Text>
            </Box>
          </Box>

          <Box className="sm:col-span-3">
            <Label htmlFor="phone" className="mb-1.5 block">電話番号</Label>
            <Input type="tel" name="phone" id="phone" defaultValue={profile?.phone || ''} />
          </Box>

          <Box className="sm:col-span-6">
            <Label htmlFor="address" className="mb-1.5 block">住所</Label>
            <Input type="text" name="address" id="address" defaultValue={profile?.address || ''} />
          </Box>
        </Box>

        <Box className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-border mt-4 gap-4">
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={async () => {
              if (!confirm('この会員を本当に削除しますか？\n（同時にお子様の情報もすべて論理削除されます。現年度以降の役員として登録されている場合は削除できません）')) return

              setIsDeleting(true)
              setMessage(null)

              const formData = new FormData()
              formData.append('id', profile.id)

              const result = await adminDeleteProfile(formData)
              if (result && !result.success) {
                setMessage(result.message)
                setIsDeleting(false)
              }
            }}
            className="w-full sm:w-auto text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive gap-2 h-10 px-4"
          >
            <Trash2 size={16} />
            {isDeleting ? '削除中...' : '会員を削除'}
          </Button>

          <Button type="submit" activeScale={true} className="w-full sm:w-auto gap-2 px-8 h-10 font-bold shadow-md">
            <Save size={16} />
            保護者情報を更新
          </Button>
        </Box>
      </Stack>
    </form>
  )
}
