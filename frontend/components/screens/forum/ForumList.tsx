import Link from 'next/link'
import { MessageCircleQuestion } from 'lucide-react'
import ForumCard from '@/components/forum/ForumCard'
import QuestionDialog from '@/components/forum/QuestionDialog'
import ForumSearch from '@/components/forum/ForumSearch'
import { Box } from '@/ui/layout/Box'
import { Stack, HStack } from '@/ui/layout/Stack'
import { Text } from '@/ui/primitives/Text'
import { Heading } from '@/ui/primitives/Heading'
import { Button } from '@/ui/primitives/Button'

type Props = {
  questions: any[]
}

export function ForumScreen({ questions }: Props) {
  return (
    <Box className="space-y-6">
      <Stack className="gap-4">
        <Heading size="h2" className="text-lg font-bold text-foreground flex items-center gap-2">
          <MessageCircleQuestion size={20} className="text-primary" />
          質問掲示板
        </Heading>
        <ForumSearch />
      </Stack>

      <Stack className="gap-6 pt-6 border-t border-border">
        <Heading size="h3" className="text-lg font-bold flex items-center gap-2 px-1">
          <Box className="w-1 h-5 bg-primary rounded-full" />
          最近の投稿
        </Heading>

        {questions.length === 0 ? (
          <Box className="bg-background border-2 border-dashed border-border rounded-[2rem] p-16 text-center">
            <Box className="w-16 h-16 bg-muted rounded-3xl flex items-center justify-center text-muted-foreground/30 mx-auto mb-4">
              <MessageCircleQuestion size={32} />
            </Box>
            <Text className="text-muted-foreground font-medium">まだ質問がありません。<br />最初の質問を投稿してみませんか？</Text>
          </Box>
        ) : (
          <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {questions.map((q) => (
              <ForumCard key={q.id} question={q} />
            ))}
          </Box>
        )}
      </Stack>

      <QuestionDialog />
    </Box>
  )
}
