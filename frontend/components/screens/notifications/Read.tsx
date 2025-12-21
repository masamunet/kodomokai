'use client'

import { Box } from '@/ui/layout/Box'
import { Stack } from '@/ui/layout/Stack'
import { Text } from '@/ui/primitives/Text'
import { Heading } from '@/ui/primitives/Heading'
import { Button } from '@/ui/primitives/Button'
import Link from 'next/link'

interface ReadScreenProps {
  error?: string
}

export function ReadScreen({ error }: ReadScreenProps) {
  return (
    <Box className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Stack className="items-center gap-6 text-center bg-background p-12 rounded-2xl border border-border shadow-xl max-w-md w-full">
        <Box className="bg-muted/10 p-4 rounded-full">
          <Text className="text-4xl">{error ? '⚠️' : '✅'}</Text>
        </Box>
        <Stack className="gap-2">
          <Heading size="h2" className="text-2xl font-bold">{error ? 'エラー' : '処理中'}</Heading>
          <Text className="text-muted-foreground">{error || '通知を既読にしています...'}</Text>
        </Stack>
        <Button asChild activeScale={true} className="w-full h-12 font-bold text-base shadow-lg">
          <Link href="/">ダッシュボードへ</Link>
        </Button>
      </Stack>
    </Box>
  )
}
