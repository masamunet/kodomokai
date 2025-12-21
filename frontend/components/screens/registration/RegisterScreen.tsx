'use client'

import { useState } from 'react'
import { Input } from '@/ui/primitives/Input'
import { sendMagicLink } from '@/app/actions/auth'
import { signInWithGoogle } from '@/app/login/actions'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Box } from '@/ui/layout/Box'
import { Stack, HStack } from '@/ui/layout/Stack'
import { Heading } from '@/ui/primitives/Heading'
import { Text } from '@/ui/primitives/Text'
import { Button } from '@/ui/primitives/Button'
import { Card, CardContent } from '@/ui/primitives/Card'
import { Mail, AlertCircle, ArrowRight, Chrome } from 'lucide-react'

export function RegisterScreen() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorCode, setErrorCode] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setErrorCode('')
    setLoading(true)

    try {
      const result = await sendMagicLink(email)
      if (result.success) {
        setIsSubmitted(true)
      } else {
        setError(result.message || 'メール送信に失敗しました')
        if (result.code) {
          setErrorCode(result.code)
        }
      }
    } catch (err) {
      setError('予期せぬエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <Box className="w-full flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="border-border shadow-2xl overflow-hidden bg-background">
            <CardContent className="p-8 text-center">
              <Box className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-6">
                <Mail size={32} />
              </Box>
              <Heading size="h2" className="text-2xl font-bold text-foreground mb-4">メールを確認してください</Heading>
              <Text className="text-muted-foreground mb-8 leading-relaxed">
                <Text weight="bold" className="text-foreground">{email}</Text> 宛に確認メールを送信しました。<br />
                メール内のリンクをクリックして、登録手続きへ進んでください。
              </Text>
              <Box className="p-4 bg-muted/50 rounded-xl">
                <Text className="text-xs text-muted-foreground">
                  メールが届かない場合は、迷惑メールフォルダをご確認ください。
                </Text>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </Box>
    )
  }

  return (
    <Box className="w-full flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Stack className="gap-8">
          <Box className="text-center">
            <Heading size="h1" className="text-3xl font-black text-foreground mb-3">新規入会</Heading>
            <Text className="text-muted-foreground leading-relaxed">
              まずはメールアドレスを入力してください。<br />
              ご本人確認のためのメールを送信します。
            </Text>
          </Box>

          <Card className="border-border shadow-xl bg-background overflow-hidden">
            <CardContent className="p-8">
              <Stack className="gap-6">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => signInWithGoogle()}
                  className="w-full h-12 gap-3 border-border hover:bg-muted font-bold"
                  activeScale={true}
                >
                  <Chrome size={20} className="text-red-500" />
                  Googleで登録
                </Button>

                <HStack className="items-center gap-4">
                  <Box className="h-px flex-1 bg-border" />
                  <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest">または</Text>
                  <Box className="h-px flex-1 bg-border" />
                </HStack>

                <form onSubmit={handleSubmit}>
                  <Stack className="gap-6">
                    <Stack className="gap-2">
                      <HStack className="justify-between">
                        <Text weight="bold" className="text-sm">メールアドレス</Text>
                      </HStack>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@email.com"
                        disabled={loading}
                        className="h-12 px-4 rounded-xl border-border focus:ring-primary"
                      />
                    </Stack>

                    {error && (
                      <Box className="p-4 bg-destructive/5 border border-destructive/20 rounded-xl space-y-3">
                        <HStack className="gap-2 items-center text-destructive">
                          <AlertCircle size={16} />
                          <Text weight="bold" className="text-sm">{error}</Text>
                        </HStack>
                        {errorCode === 'ALREADY_REGISTERED' && (
                          <Stack className="gap-2 pl-6">
                            <Button variant="link" asChild className="p-0 h-auto text-primary justify-start font-bold">
                              <Link href="/login">ログイン画面へ移動 →</Link>
                            </Button>
                            <Button variant="link" asChild className="p-0 h-auto text-muted-foreground justify-start text-xs">
                              <Link href="/forgot-password">パスワードをお忘れの方</Link>
                            </Button>
                          </Stack>
                        )}
                      </Box>
                    )}

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 font-bold text-lg shadow-lg shadow-primary/20"
                      activeScale={true}
                    >
                      {loading ? '送信中...' : '確認メールを送信'}
                      {!loading && <ArrowRight size={18} className="ml-2" />}
                    </Button>
                  </Stack>
                </form>
              </Stack>
            </CardContent>
          </Card>

          <Box className="text-center">
            <Text className="text-sm text-muted-foreground">
              アカウントをお持ちの方は{' '}
              <Link href="/login" className="text-primary font-bold hover:underline">
                ログイン
              </Link>
            </Text>
          </Box>
        </Stack>
      </motion.div>
    </Box>
  )
}
