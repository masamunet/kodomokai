'use client'

import Link from 'next/link'
import { MessageSquare, CheckCircle2, Clock, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Card, CardContent } from '@/ui/primitives/Card'
import { Badge } from '@/ui/primitives/Badge'
import { Button } from '@/ui/primitives/Button'
import { Box } from '@/ui/layout/Box'
import { Stack, HStack } from '@/ui/layout/Stack'
import { Text } from '@/ui/primitives/Text'
import { Heading } from '@/ui/primitives/Heading'

type Props = {
  question: any
}

export default function ForumCard({ question }: Props) {
  const answerCount = question.forum_answers?.length || 0
  const reactionCount = question.forum_reactions?.length || 0

  return (
    <Card className="hover:bg-muted/30 transition-colors border-border overflow-hidden">
      <CardContent className="p-6">
        <Stack className="gap-4">
          <HStack className="justify-between items-start">
            <HStack className="gap-2 items-center text-xs text-muted-foreground">
              <HStack className="gap-1 items-center bg-muted px-2 py-1 rounded-md">
                <User size={12} />
                <Text>{question.profiles?.last_name} {question.profiles?.first_name}</Text>
              </HStack>
              <HStack className="gap-1 items-center">
                <Clock size={12} />
                <Text>{formatDistanceToNow(new Date(question.created_at), { addSuffix: true, locale: ja })}</Text>
              </HStack>
            </HStack>
            {question.is_resolved && (
              <Badge variant="outline" className="text-[10px] gap-1 border-green-200 text-green-700 bg-green-50">
                <CheckCircle2 size={10} />
                解決済み
              </Badge>
            )}
          </HStack>

          <Box>
            <Link href={`/forum/${question.id}`} className="group block space-y-2">
              <Heading size="h3" className="text-xl font-bold group-hover:text-primary transition-colors">
                {question.title}
              </Heading>
              <Text className="text-muted-foreground line-clamp-3 leading-relaxed">
                {question.content}
              </Text>
            </Link>
          </Box>

          <HStack className="justify-between items-center pt-2">
            <HStack className="gap-4">
              <HStack className="gap-1.5 items-center text-muted-foreground">
                <MessageSquare size={16} />
                <Text className="text-sm font-bold">{answerCount}</Text>
                <Text className="text-xs">回答</Text>
              </HStack>

              {reactionCount > 0 && (
                <HStack className="gap-1 items-center -space-x-2">
                  {Array.from(new Set(question.forum_reactions.map((r: any) => r.emoji))).slice(0, 3).map((emoji: any, i) => (
                    <Box key={i} className="w-6 h-6 rounded-full bg-background border flex items-center justify-center text-xs relative z-10">
                      {emoji}
                    </Box>
                  ))}
                  <Text className="text-xs text-muted-foreground pl-3">{reactionCount}</Text>
                </HStack>
              )}
            </HStack>

            <Button variant="outline" size="sm" asChild className="text-xs">
              <Link href={`/forum/${question.id}`}>
                詳細・回答する
              </Link>
            </Button>
          </HStack>

          {answerCount > 0 && (
            <Box className="mt-2 pt-4 border-t border-border">
              <Text className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Recent Answers</Text>
              <Stack className="gap-3">
                {question.forum_answers.map((answer: any) => (
                  <Box key={answer.id} className="bg-muted/30 p-3 rounded-lg border border-border/50 text-sm">
                    <HStack className="justify-between items-center mb-1">
                      <Text className="text-xs font-bold text-muted-foreground">
                        {answer.profiles?.last_name} {answer.profiles?.first_name}
                      </Text>
                      <Text className="text-[10px] text-muted-foreground/60">
                        {formatDistanceToNow(new Date(answer.created_at), { addSuffix: true, locale: ja })}
                      </Text>
                    </HStack>
                    <Text className="text-foreground/80 line-clamp-2 text-xs">{answer.content}</Text>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}
