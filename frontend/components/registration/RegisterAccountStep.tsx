import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Info } from 'lucide-react'
import { Box } from '@/ui/layout/Box'
import { Stack, HStack } from '@/ui/layout/Stack'
import { Text } from '@/ui/primitives/Text'
import { Button } from '@/ui/primitives/Button'
import { Input } from '@/ui/primitives/Input'
import { Label } from '@/ui/primitives/Label'

const schema = z.object({
  email: z.string().email('正しいメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
})

type FormData = z.infer<typeof schema>

type Props = {
  data: any
  updateData: (data: any) => void
  onNext: () => void
}

export default function RegisterAccountStep({ data, updateData, onNext }: Props) {
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
      <Box className="bg-primary/5 border-l-4 border-primary p-4 rounded-r-md">
        <HStack className="gap-3 items-start">
          <Box className="mt-0.5 text-primary">
            <Info size={18} />
          </Box>
          <Text className="text-sm text-primary/80 leading-relaxed font-medium">
            メールアドレスに招待メールを送ります。実際に受信できるメールアドレスを使用してください。
          </Text>
        </HStack>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack className="gap-6">
          <Box>
            <Label htmlFor="email" className="mb-1.5 block">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="example@kodomokai.com"
              {...register('email')}
            />
            {errors.email && (
              <Text className="mt-2 text-xs text-destructive">{errors.email.message}</Text>
            )}
          </Box>

          <Box>
            <Label htmlFor="password" className="mb-1.5 block">パスワード</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              {...register('password')}
            />
            <Text className="mt-1.5 text-[10px] text-muted-foreground italic">※後から変更可能です</Text>
            {errors.password && (
              <Text className="mt-2 text-xs text-destructive">{errors.password.message}</Text>
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
