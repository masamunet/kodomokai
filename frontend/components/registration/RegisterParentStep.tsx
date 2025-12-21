import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toHiragana } from '@/lib/utils'
import { Box } from '@/ui/layout/Box'
import { Stack, HStack } from '@/ui/layout/Stack'
import { Text } from '@/ui/primitives/Text'
import { Heading } from '@/ui/primitives/Heading'
import { Button } from '@/ui/primitives/Button'
import { Input } from '@/ui/primitives/Input'
import { Label } from '@/ui/primitives/Label'

const schema = z.object({
  lastName: z.string().min(1, '苗字を入力してください'),
  firstName: z.string().min(1, '名前を入力してください'),
  lastNameKana: z.string().min(1, '苗字（ふりがな）を入力してください'),
  firstNameKana: z.string().min(1, '名前（ふりがな）を入力してください'),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().min(1, '住所を入力してください'),
})

type FormData = z.infer<typeof schema>

type Props = {
  data: any
  updateData: (data: any) => void
  onNext: () => void
  onPrev: () => void
}

export default function RegisterParentStep({ data, updateData, onNext, onPrev }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: data,
  })

  const onSubmit = (formData: FormData) => {
    updateData({
      ...formData,
      lastNameKana: toHiragana(formData.lastNameKana),
      firstNameKana: toHiragana(formData.firstNameKana),
      phone: formData.phone || '',
      address: formData.address || '',
    })
    onNext()
  }

  return (
    <Stack className="gap-8">
      <Box className="text-center">
        <Heading size="h3" className="text-xl font-bold">保護者情報の入力</Heading>
        <Text className="text-sm text-muted-foreground mt-1">
          まずはじめに、保護者のお名前を入力します。
        </Text>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack className="gap-6">
          <Box>
            <Label className="mb-1.5 block">お名前</Label>
            <HStack className="gap-3">
              <Box className="flex-1">
                <Input {...register('lastName')} placeholder="苗字 (例: 山田)" />
                {errors.lastName && <Text className="text-[10px] text-destructive mt-1">{errors.lastName.message}</Text>}
              </Box>
              <Box className="flex-1">
                <Input {...register('firstName')} placeholder="名前 (例: 太郎)" />
                {errors.firstName && <Text className="text-[10px] text-destructive mt-1">{errors.firstName.message}</Text>}
              </Box>
            </HStack>
          </Box>

          <Box>
            <Label className="mb-1.5 block">ふりがな</Label>
            <HStack className="gap-3">
              <Box className="flex-1">
                <Input {...register('lastNameKana')} placeholder="みょうじ (例: やまだ)" autoComplete="off" />
                {errors.lastNameKana && <Text className="text-[10px] text-destructive mt-1">{errors.lastNameKana.message}</Text>}
              </Box>
              <Box className="flex-1">
                <Input {...register('firstNameKana')} placeholder="なまえ (例: たろう)" autoComplete="off" />
                {errors.firstNameKana && <Text className="text-[10px] text-destructive mt-1">{errors.firstNameKana.message}</Text>}
              </Box>
            </HStack>
            <Text className="text-[10px] text-muted-foreground mt-1.5">※カタカナは登録時に自動的にひらがなに変換されます</Text>
          </Box>

          <Box>
            <Label className="mb-1.5 block">住所</Label>
            <Input {...register('address')} placeholder="東京都..." />
            {errors.address && <Text className="text-[10px] text-destructive mt-1">{errors.address.message}</Text>}
          </Box>

          <Box>
            <Label className="mb-1.5 block">電話番号</Label>
            <Input type="tel" {...register('phone')} placeholder="09012345678" />
            {errors.phone && <Text className="text-[10px] text-destructive mt-1">{errors.phone.message}</Text>}
          </Box>

          <HStack className="justify-between items-center pt-8 border-t border-border mt-4">
            <Button
              variant="ghost"
              type="button"
              onClick={onPrev}
              className="gap-2 px-6 h-11 text-muted-foreground hover:bg-muted font-semibold"
              activeScale={true}
            >
              戻る
            </Button>
            <Button
              type="submit"
              className="px-10 h-11 font-bold shadow-md"
              activeScale={true}
            >
              次へ
            </Button>
          </HStack>
        </Stack>
      </form>
    </Stack>
  )
}
