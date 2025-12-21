import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { Box } from '@/ui/layout/Box'
import { Stack } from '@/ui/layout/Stack'
import { Text } from '@/ui/primitives/Text'
import { Heading } from '@/ui/primitives/Heading'
import { Button } from '@/ui/primitives/Button'
import { Card, CardContent } from '@/ui/primitives/Card'

export function AuthCodeErrorScreen() {
  return (
    <Box className="flex min-h-screen items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md shadow-lg border-border bg-background">
        <CardContent className="pt-8 pb-10 px-6 sm:px-10 text-center">
          <Box className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center text-destructive mx-auto mb-6">
            <AlertCircle size={32} />
          </Box>
          <Heading size="h2" className="text-2xl font-bold text-foreground mb-4">認証エラー</Heading>
          <Text className="text-muted-foreground mb-8 leading-relaxed">
            認証コードが無効か、期限切れです。<br />
            もう一度最初からやり直してください。
          </Text>
          <Stack className="gap-3">
            <Button asChild className="w-full h-11 font-bold shadow-sm" activeScale={true}>
              <Link href="/register">新規登録画面へ戻る</Link>
            </Button>
            <Button variant="outline" asChild className="w-full h-11 font-bold border-border" activeScale={true}>
              <Link href="/login">ログイン画面へ</Link>
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
