import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Box } from '@/ui/layout/Box'
import { Stack, HStack } from '@/ui/layout/Stack'
import { Text } from '@/ui/primitives/Text'
import { Heading } from '@/ui/primitives/Heading'
import { Button } from '@/ui/primitives/Button'
import { Input } from '@/ui/primitives/Input'
import { Label } from '@/ui/primitives/Label'
import { KeyRound } from 'lucide-react'

const schema = z.object({
  password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
})

type FormData = z.infer<typeof schema>

type Props = {
  data: { password: string }
  updateData: (data: { password: string }) => void
  onNext: () => void
}

export default function SetPasswordStep({ data, updateData, onNext }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: data,
  })

  const onSubmit = (formData: FormData) => {
    updateData(formData)
    onNext()
  }

  return (
    <Stack className="gap-8">
      <Box className="text-center">
        <Box className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4">
          <KeyRound size={32} />
        </Box>
        <Heading size="h3" className="text-xl font-bold">パスワードの設定</Heading>
        <Text className="text-sm text-muted-foreground mt-1">
          ログイン時に使用するパスワードを設定してください。
        </Text>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack className="gap-6">
          <Box>
            <Label htmlFor="password" className="mb-1.5 block">パスワード</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="8文字以上で入力"
              {...register('password')}
            />
            <Text className="mt-1.5 text-[10px] text-muted-foreground italic">※後から変更可能です</Text>
            {errors.password && (
              <Text className="mt-2 text-xs text-destructive font-medium">{errors.password.message}</Text>
            )}
          </Box>

          <Box className="pt-4">
            <Button
              type="submit"
              className="w-full h-11 font-bold shadow-md"
              activeScale={true}
            >
              次へ
            </Button>
          </Box>
        </Stack>
      </form>
    </Stack>
  )
}
