import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Trash2, Plus } from 'lucide-react'
import { toHiragana } from '@/lib/utils'
import { Box } from '@/ui/layout/Box'
import { Stack, HStack } from '@/ui/layout/Stack'
import { Text } from '@/ui/primitives/Text'
import { Heading } from '@/ui/primitives/Heading'
import { Button } from '@/ui/primitives/Button'
import { Input } from '@/ui/primitives/Input'
import { Label } from '@/ui/primitives/Label'
import { Card, CardContent } from '@/ui/primitives/Card'
import { Badge } from '@/ui/primitives/Badge'

// Schema for a single child
const childSchema = z.object({
  lastName: z.string().min(1, '苗字を入力してください'),
  firstName: z.string().min(1, '名前を入力してください'),
  lastNameKana: z.string().min(1, '苗字（ふりがな）を入力してください'),
  firstNameKana: z.string().min(1, '名前（ふりがな）を入力してください'),
  birthday: z.string().min(1, '生年月日を入力してください'),
  gender: z.string().min(1, '性別を選択してください'),
  allergies: z.string().optional(),
  notes: z.string().optional(),
})

type ChildFormData = z.infer<typeof childSchema>

type Props = {
  data: any[]
  parentLastName: string
  parentLastNameKana: string
  updateData: (data: any[]) => void
  onNext: () => void
  onPrev: () => void
}

export default function RegisterChildrenStep({ data, parentLastName, parentLastNameKana, updateData, onNext, onPrev }: Props) {
  const [isAdding, setIsAdding] = useState(data.length === 0)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChildFormData>({
    resolver: zodResolver(childSchema),
    defaultValues: {
      lastName: parentLastName,
      lastNameKana: parentLastNameKana,
      gender: 'male'
    },
  })

  const onAddChild = (childData: ChildFormData) => {
    updateData([...data, {
      ...childData,
      lastNameKana: toHiragana(childData.lastNameKana),
      firstNameKana: toHiragana(childData.firstNameKana),
      allergies: childData.allergies || '',
      notes: childData.notes || '',
    }])
    reset({
      lastName: parentLastName,
      lastNameKana: parentLastNameKana,
      gender: 'male'
    })
    setIsAdding(false)
  }

  const onRemoveChild = (index: number) => {
    const newData = [...data]
    newData.splice(index, 1)
    updateData(newData)
    if (newData.length === 0) {
      setIsAdding(true)
    }
  }

  return (
    <Stack className="gap-8">
      <Box className="text-center">
        <Heading size="h3" className="text-xl font-bold">お子様情報の入力</Heading>
        <Text className="text-sm text-muted-foreground mt-1">
          お子様のお名前を入力します。一人ずつ追加してください。
        </Text>
      </Box>

      {/* List of added children */}
      {data.length > 0 && (
        <Stack className="gap-4">
          {data.map((child, index) => (
            <Card key={index} className="relative bg-muted/30 border-border overflow-hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemoveChild(index)}
                className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors z-10"
              >
                <Trash2 size={16} />
              </Button>
              <CardContent className="p-4">
                <HStack className="gap-2 items-baseline">
                  <Text weight="bold" className="text-lg">
                    {child.lastName} {child.firstName}
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    ({child.lastNameKana} {child.firstNameKana})
                  </Text>
                </HStack>
                <HStack className="gap-3 mt-1.5 items-center">
                  <Badge variant="outline" className="text-[10px] h-5 bg-background border-border">
                    {child.gender === 'male' ? '男の子' : child.gender === 'female' ? '女の子' : 'その他'}
                  </Badge>
                  <Text className="text-xs text-muted-foreground">
                    {new Date(child.birthday).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}生
                  </Text>
                </HStack>
              </CardContent>
            </Card>
          ))}

          {!isAdding && (
            <Button
              variant="outline"
              onClick={() => setIsAdding(true)}
              className="w-full h-12 border-dashed border-2 border-muted-foreground/30 hover:border-primary hover:text-primary transition-all gap-2"
              activeScale={true}
            >
              <Plus size={16} />
              もう一人追加する
            </Button>
          )}
        </Stack>
      )}

      {/* Add Form */}
      {isAdding && (
        <Card className="border-border shadow-md">
          <CardContent className="p-6">
            <Heading size="h4" className="text-sm font-bold border-b border-border pb-3 mb-6 flex items-center gap-2">
              <Box className="w-1 h-4 bg-primary rounded-full" />
              新規追加
            </Heading>

            <form id="child-form" onSubmit={handleSubmit(onAddChild)}>
              <Stack className="gap-6">
                <Stack className="gap-4">
                  <Box>
                    <Label className="mb-1.5 block">お名前</Label>
                    <HStack className="gap-3">
                      <Box className="flex-1">
                        <Input {...register('lastName')} placeholder="苗字" />
                        {errors.lastName && <Text className="text-[10px] text-destructive mt-1">{errors.lastName.message}</Text>}
                      </Box>
                      <Box className="flex-1">
                        <Input {...register('firstName')} placeholder="名前" />
                        {errors.firstName && <Text className="text-[10px] text-destructive mt-1">{errors.firstName.message}</Text>}
                      </Box>
                    </HStack>
                  </Box>

                  <Box>
                    <Label className="mb-1.5 block">ふりがな</Label>
                    <HStack className="gap-3">
                      <Box className="flex-1">
                        <Input {...register('lastNameKana')} placeholder="みょうじ" autoComplete="off" />
                        {errors.lastNameKana && <Text className="text-[10px] text-destructive mt-1">{errors.lastNameKana.message}</Text>}
                      </Box>
                      <Box className="flex-1">
                        <Input {...register('firstNameKana')} placeholder="なまえ" autoComplete="off" />
                        {errors.firstNameKana && <Text className="text-[10px] text-destructive mt-1">{errors.firstNameKana.message}</Text>}
                      </Box>
                    </HStack>
                    <Text className="text-[10px] text-muted-foreground mt-1.5">※カタカナは登録時に自動的にひらがなに変換されます</Text>
                  </Box>

                  <HStack className="gap-3">
                    <Box className="flex-1">
                      <Label className="mb-1.5 block">生年月日</Label>
                      <Input type="date" {...register('birthday')} />
                      {errors.birthday && <Text className="text-[10px] text-destructive mt-1">{errors.birthday.message}</Text>}
                    </Box>
                    <Box className="flex-1">
                      <Label className="mb-1.5 block">性別</Label>
                      <select
                        {...register('gender')}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="male">男の子</option>
                        <option value="female">女の子</option>
                        <option value="other">その他</option>
                      </select>
                    </Box>
                  </HStack>

                  <Box>
                    <Label className="mb-1.5 block">アレルギー (任意)</Label>
                    <Input {...register('allergies')} placeholder="卵、そば等" />
                  </Box>

                  <Box>
                    <Label className="mb-1.5 block">特記事項 (任意)</Label>
                    <textarea
                      {...register('notes')}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      rows={2}
                    ></textarea>
                  </Box>
                </Stack>

                <HStack className="justify-end gap-3 pt-4 border-t border-border">
                  {data.length > 0 && (
                    <Button variant="outline" type="button" onClick={() => setIsAdding(false)} className="h-10 px-6 font-semibold">
                      キャンセル
                    </Button>
                  )}
                  <Button type="submit" className="h-10 px-8 font-bold shadow-sm" activeScale={true}>
                    {data.length > 0 ? '追加する' : 'この内容で登録'}
                  </Button>
                </HStack>
              </Stack>
            </form>
          </CardContent>
        </Card>
      )}

      <HStack className="justify-between items-center pt-8 border-t border-border mt-4">
        <Button
          variant="ghost"
          onClick={onPrev}
          className="gap-2 px-6 h-11 text-muted-foreground hover:bg-muted font-semibold"
          activeScale={true}
        >
          戻る
        </Button>
        <Button
          onClick={onNext}
          disabled={data.length === 0 || isAdding}
          className="px-10 h-11 font-bold shadow-md"
          activeScale={true}
        >
          次へ
        </Button>
      </HStack>
    </Stack>
  )
}
