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
    <Box className="mb-10">
      <Box className="mb-10">
        <Box className="bg-gradient-to-br from-primary to-primary/80 rounded-[2rem] p-8 md:p-12 text-primary-foreground shadow-2xl shadow-primary/20 relative overflow-hidden">
          <Box className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
          <Box className="relative z-10 max-w-2xl">
            <Heading size="h2" className="text-2xl md:text-4xl font-bold mb-4 leading-tight">
              子ども会のことで<br />わからないことはありますか？
            </Heading>
            <Text className="text-primary-foreground/80 text-base md:text-lg max-w-md leading-relaxed mb-8">
              役員への質問や、会員同士の相談など、気軽にお使いください。
            </Text>

            <ForumSearch />
          </Box>
        </Box>
      </Box>

      <Stack className="gap-6">
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
