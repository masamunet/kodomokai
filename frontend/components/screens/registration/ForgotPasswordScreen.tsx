'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { sendPasswordResetEmail } from '@/app/actions/auth'
import Link from 'next/link'
import { Input } from '@/ui/primitives/Input'
import { Box } from '@/ui/layout/Box'
import { Stack, HStack } from '@/ui/layout/Stack'
import { Heading } from '@/ui/primitives/Heading'
import { Text } from '@/ui/primitives/Text'
import { Button } from '@/ui/primitives/Button'
import { Card, CardContent } from '@/ui/primitives/Card'
import { Label } from '@/ui/primitives/Label'
import { Loader2, ArrowLeft, Mail, AlertCircle, Send } from 'lucide-react'

export function ForgotPasswordScreen() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setStatus('loading')
    setErrorMessage('')

    try {
      const result = await sendPasswordResetEmail(email)
      if (result.success) {
        setIsSubmitted(true)
        setStatus('success')
      } else {
        setStatus('error')
        setErrorMessage(result.message || '送信に失敗しました')
      }
    } catch (e) {
      setStatus('error')
      setErrorMessage('予期せぬエラーが発生しました')
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
                <Text weight="bold" className="text-foreground">{email}</Text> 宛にパスワード再設定用のメールを送信しました。<br />
                メール内のリンクをクリックして、新しいパスワードを設定してください。
              </Text>
              <Button variant="ghost" asChild className="text-primary font-bold" activeScale={true}>
                <Link href="/login">ログイン画面に戻る</Link>
              </Button>
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
            <Heading size="h1" className="text-3xl font-black text-foreground mb-3">パスワード再設定</Heading>
            <Text className="text-muted-foreground leading-relaxed">
              登録済みのメールアドレスを入力してください。<br />
              再設定用のリンクを送信します。
            </Text>
          </Box>

          <Card className="border-border shadow-xl bg-background overflow-hidden">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit}>
                <Stack className="gap-6">
                  <Stack className="gap-2">
                    <Label htmlFor="email" className="font-bold text-sm">メールアドレス</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@email.com"
                      disabled={status === 'loading'}
                      className="h-12 px-4 rounded-xl border-border focus:ring-primary"
                    />
                  </Stack>

                  {status === 'error' && (
                    <Box className="p-4 bg-destructive/5 border border-destructive/20 rounded-xl">
                      <HStack className="gap-2 items-center text-destructive">
                        <AlertCircle size={16} />
                        <Text weight="bold" className="text-sm">{errorMessage}</Text>
                      </HStack>
                    </Box>
                  )}

                  <Button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full h-12 font-bold text-lg shadow-lg shadow-primary/20"
                    activeScale={true}
                  >
                    {status === 'loading' ? (
                      <Loader2 className="animate-spin h-5 w-5" />
                    ) : (
                      <HStack className="gap-2">
                        <Send size={18} />
                        送信する
                      </HStack>
                    )}
                  </Button>

                  <Box className="text-center">
                    <Button variant="ghost" asChild className="text-sm text-muted-foreground hover:text-foreground" activeScale={true}>
                      <Link href="/login">
                        <ArrowLeft size={16} className="mr-2" />
                        ログイン画面に戻る
                      </Link>
                    </Button>
                  </Box>
                </Stack>
              </form>
            </CardContent>
          </Card>
        </Stack>
      </motion.div>
    </Box>
  )
}

