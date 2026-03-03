'use client'

import { Box } from '@/ui/layout/Box'
import { Heading } from '@/ui/primitives/Heading'
import { Text } from '@/ui/primitives/Text'
import { Play } from 'lucide-react'

export function ExecutionPlaceholder() {
  return (
    <Box className="flex flex-col items-center justify-center p-12 text-center bg-muted/20 border border-dashed border-border rounded-xl">
      <Box className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
        <Play size={32} />
      </Box>
      <Heading size="h3" className="mb-2">総会執行機能は準備中です</Heading>
      <Text className="text-muted-foreground max-w-md mx-auto">
        このページでは、総会当日のスムーズな運営をサポートする機能を提供予定です。資料の準備が整いましたら、こちらから執行を行えるようになります。
      </Text>
    </Box>
  )
}
