import Link from 'next/link'
import { ArrowLeft, MessageSquare, CheckCircle2, User, Send, Clock, ShieldCheck } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import ReactionBar from '@/components/forum/ReactionBar'
import { Box } from '@/ui/layout/Box'
import { Stack, HStack } from '@/ui/layout/Stack'
import { Text } from '@/ui/primitives/Text'
import { Heading } from '@/ui/primitives/Heading'
import { Button } from '@/ui/primitives/Button'
import { Card, CardContent } from '@/ui/primitives/Card'
import { Badge } from '@/ui/primitives/Badge'

type Props = {
  question: any
  user: any
  handleSubmitAnswer: (formData: FormData) => Promise<void>
}

export function ForumDetailScreen({ question, user, handleSubmitAnswer }: Props) {
  return (
    <Box className="min-h-screen bg-muted/30 pb-32">
      <Box asChild className="bg-background/80 backdrop-blur-xl sticky top-0 z-20 border-b border-border">
        <header>
          <Box className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="rounded-xl h-10 w-10" activeScale={true}>
              <Link href="/forum">
                <ArrowLeft size={20} />
              </Link>
            </Button>
            <Heading size="h1" className="text-lg font-bold truncate">質問の詳細</Heading>
          </Box>
        </header>
      </Box>

      <Box asChild className="max-w-4xl mx-auto px-4 py-8">
        <main>
          {/* Question Header */}
          <Card className="border-border shadow-sm mb-8 relative overflow-hidden bg-background">
            <CardContent className="p-8">
              <HStack className="justify-between items-start mb-6">
                <HStack className="gap-3">
                  <Box className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary border border-primary/10">
                    <User size={24} />
                  </Box>
                  <Box>
                    <Text weight="bold" className="text-foreground">
                      {question.profiles?.last_name} {question.profiles?.first_name}
                    </Text>
                    <HStack className="gap-1.5 mt-0.5 items-center">
                      <Clock size={12} className="text-muted-foreground" />
                      <Text className="text-[11px] text-muted-foreground font-medium">
                        {formatDistanceToNow(new Date(question.created_at), { addSuffix: true, locale: ja })}
                      </Text>
                    </HStack>
                  </Box>
                </HStack>
                {question.is_resolved && (
                  <Badge variant="success" className="gap-1.5 px-3 py-1 font-bold uppercase tracking-wider text-[10px]">
                    <CheckCircle2 size={12} />
                    解決済み
                  </Badge>
                )}
              </HStack>

              <Heading size="h2" className="text-2xl font-black text-foreground mb-4 leading-tight">
                {question.title}
              </Heading>

              <Text className="text-foreground/90 text-lg leading-relaxed mb-8 whitespace-pre-wrap">
                {question.content}
              </Text>

              <Box className="border-t border-border pt-4">
                <ReactionBar
                  targetType="question"
                  targetId={question.id}
                  reactions={question.forum_reactions}
                  userId={user?.id}
                />
              </Box>
            </CardContent>
          </Card>

          {/* Answers List */}
          <Stack className="mb-12 gap-6">
            <Heading size="h3" className="text-xl font-bold flex items-center gap-2 px-2">
              <MessageSquare size={20} className="text-primary" />
              回答 {question.forum_answers?.length || 0} 件
            </Heading>

            <Stack className="gap-6">
              {question.forum_answers?.length === 0 ? (
                <Box className="bg-background/50 border-2 border-dashed border-border rounded-3xl p-16 text-center text-muted-foreground font-medium">
                  まだ回答はありません。あなたの知っていることを教えてあげませんか？
                </Box>
              ) : (
                question.forum_answers.map((answer: any) => (
                  <Card key={answer.id} className="border-border shadow-sm relative transition-all hover:border-primary/20 bg-background">
                    <CardContent className="p-6">
                      <HStack className="justify-between items-start mb-4">
                        <HStack className="gap-3">
                          <Box className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-muted-foreground/50 border border-border/50">
                            <User size={20} />
                          </Box>
                          <Box>
                            <Text weight="bold" className="text-foreground text-sm">
                              {answer.profiles?.last_name} {answer.profiles?.first_name}
                            </Text>
                            <HStack className="gap-1.5 mt-0.5 items-center">
                              <Clock size={10} className="text-muted-foreground" />
                              <Text className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-none">
                                {formatDistanceToNow(new Date(answer.created_at), { addSuffix: true, locale: ja })}
                              </Text>
                            </HStack>
                          </Box>
                        </HStack>
                        {answer.is_best_answer && (
                          <Badge variant="warning" className="gap-1 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider">
                            <ShieldCheck size={12} />
                            Best Answer
                          </Badge>
                        )}
                      </HStack>

                      <Text className="text-foreground/90 leading-relaxed mb-6 whitespace-pre-wrap text-[15px]">
                        {answer.content}
                      </Text>

                      <Box className="border-t border-border/50 pt-3">
                        <ReactionBar
                          targetType="answer"
                          targetId={answer.id}
                          reactions={answer.forum_reactions}
                          userId={user?.id}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                ))
              )}
            </Stack>
          </Stack>

          {/* Post Answer Form */}
          <Box className="fixed bottom-8 left-0 right-0 z-30 px-4">
            <Box asChild className="bg-background/95 backdrop-blur-2xl border border-border rounded-[2rem] p-3 shadow-2xl flex items-end gap-3 max-w-2xl mx-auto ring-4 ring-background/50">
              <form action={handleSubmitAnswer}>
                <input type="hidden" name="question_id" value={question.id} />
                <Box className="flex-1">
                  <textarea
                    name="content"
                    required
                    rows={1}
                    placeholder="回答を入力する..."
                    className="w-full bg-muted/30 border-none rounded-2xl py-3 px-4 focus:ring-0 focus:bg-background transition-all text-sm outline-none resize-none min-h-[48px] max-h-32"
                  />
                </Box>
                <Button
                  type="submit"
                  size="icon"
                  className="rounded-2xl h-11 w-11 shrink-0 shadow-lg shadow-primary/20"
                  activeScale={true}
                >
                  <Send size={20} />
                </Button>
              </form>
            </Box>
          </Box>
        </main>
      </Box>
    </Box>
  )
}
