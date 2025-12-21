import { RegistrationData } from '../onboarding/RegistrationWizard'
import { Box } from '@/ui/layout/Box'
import { Stack, HStack } from '@/ui/layout/Stack'
import { Text } from '@/ui/primitives/Text'
import { Heading } from '@/ui/primitives/Heading'
import { Button } from '@/ui/primitives/Button'
import { Card, CardHeader, CardContent } from '@/ui/primitives/Card'
import { Badge } from '@/ui/primitives/Badge'

type Props = {
  data: RegistrationData
  admissionFee: number
  annualFeePerChild: number
  onNext: () => void
  onPrev: () => void
}

export default function RegisterConfirmStep({ data, admissionFee, annualFeePerChild, onNext, onPrev }: Props) {
  const totalAnnualFee = data.children.length * annualFeePerChild
  const total = admissionFee + totalAnnualFee

  return (
    <Stack className="gap-8">
      <Box className="text-center">
        <Heading size="h3" className="text-xl font-bold">入力内容の確認</Heading>
        <Text className="text-sm text-muted-foreground mt-1">
          以下の内容で登録します。よろしければ「登録する」ボタンを押してください。
        </Text>
      </Box>

      <Card className="border-border shadow-sm overflow-hidden">
        <Stack className="divide-y divide-border">
          {/* Account */}
          <Box>
            <Box className="bg-muted/30 px-4 py-2 border-b border-border">
              <Text weight="bold" className="text-xs text-muted-foreground uppercase tracking-wider">
                アカウント情報
              </Text>
            </Box>
            <Box className="p-4">
              <HStack className="gap-4">
                <Text className="w-32 text-sm text-muted-foreground">メールアドレス</Text>
                <Text weight="medium" className="text-sm">{data.account.email}</Text>
              </HStack>
            </Box>
          </Box>

          {/* Parent */}
          <Box>
            <Box className="bg-muted/30 px-4 py-2 border-b border-border">
              <Text weight="bold" className="text-xs text-muted-foreground uppercase tracking-wider">
                保護者情報
              </Text>
            </Box>
            <Stack className="p-4 gap-3">
              <HStack className="gap-4">
                <Text className="w-32 text-sm text-muted-foreground">氏名</Text>
                <Text weight="medium" className="text-sm">{data.parent.lastName} {data.parent.firstName}</Text>
              </HStack>
              <HStack className="gap-4">
                <Text className="w-32 text-sm text-muted-foreground">ふりがな</Text>
                <Text weight="medium" className="text-sm">{data.parent.lastNameKana} {data.parent.firstNameKana}</Text>
              </HStack>
              <HStack className="gap-4">
                <Text className="w-32 text-sm text-muted-foreground">電話番号</Text>
                <Text weight="medium" className="text-sm">{data.parent.phone || '-'}</Text>
              </HStack>
              <HStack className="gap-4">
                <Text className="w-32 text-sm text-muted-foreground">住所</Text>
                <Text weight="medium" className="text-sm line-clamp-2 flex-1">{data.parent.address}</Text>
              </HStack>
            </Stack>
          </Box>

          {/* Children */}
          <Box>
            <Box className="bg-muted/30 px-4 py-2 border-b border-border">
              <HStack className="justify-between">
                <Text weight="bold" className="text-xs text-muted-foreground uppercase tracking-wider">
                  お子様情報
                </Text>
                <Badge variant="secondary" className="h-4 text-[10px] px-1.5">{data.children.length}名</Badge>
              </HStack>
            </Box>
            <Stack className="p-4 divide-y divide-border/50">
              {data.children.map((child, i) => (
                <Box key={i} className="py-3 first:pt-0 last:pb-0">
                  <HStack className="gap-2 items-baseline">
                    <Text weight="bold" className="text-sm">{child.lastName} {child.firstName}</Text>
                    <Text className="text-xs text-muted-foreground">({child.lastNameKana} {child.firstNameKana})</Text>
                  </HStack>
                  <HStack className="gap-3 mt-1 items-center">
                    <Text className="text-xs text-muted-foreground">
                      {child.birthday} / {child.gender === 'male' ? '男' : child.gender === 'female' ? '女' : '他'}
                    </Text>
                  </HStack>
                  {child.allergies && (
                    <Text className="text-[10px] text-destructive mt-1 font-medium bg-destructive/5 px-2 py-0.5 rounded-sm inline-block">
                      アレルギー: {child.allergies}
                    </Text>
                  )}
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Fees */}
          <Box className="bg-primary/5 p-5">
            <Stack className="gap-3">
              <HStack className="justify-between">
                <Text className="text-sm text-muted-foreground">入会金</Text>
                <Text weight="medium" className="text-sm">{admissionFee.toLocaleString()}円</Text>
              </HStack>
              <HStack className="justify-between">
                <Text className="text-sm text-muted-foreground">年会費 ({data.children.length}名分)</Text>
                <Text weight="medium" className="text-sm">{totalAnnualFee.toLocaleString()}円</Text>
              </HStack>
              <Box className="h-px bg-primary/20 mt-1" />
              <HStack className="justify-between items-center text-primary pt-1">
                <Text weight="bold" className="text-base">合計金額</Text>
                <Text weight="bold" className="text-xl font-mono">{total.toLocaleString()}円</Text>
              </HStack>
            </Stack>
          </Box>
        </Stack>
      </Card>

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
          className="px-10 h-11 font-bold shadow-md"
          activeScale={true}
        >
          登録する
        </Button>
      </HStack>
    </Stack>
  )
}
