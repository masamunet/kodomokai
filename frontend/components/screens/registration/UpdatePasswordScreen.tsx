'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Input } from '@/ui/primitives/Input'
import { Box } from '@/ui/layout/Box'
import { Stack, HStack } from '@/ui/layout/Stack'
import { Heading } from '@/ui/primitives/Heading'
import { Text } from '@/ui/primitives/Text'
import { Button } from '@/ui/primitives/Button'
import { Card, CardContent } from '@/ui/primitives/Card'
import { Label } from '@/ui/primitives/Label'
import { Loader2, ArrowLeft, CheckCircle2, AlertCircle, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function UpdatePasswordScreen() {
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) return

    setStatus('loading')
    setErrorMessage('')

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })

      if (!error || error.message.includes('New password should be different')) {
        setStatus('success')
        setTimeout(() => {
          router.push('/')
        }, 3000)
      } else {
        setStatus('error')
        setErrorMessage(error.message || 'パスワードの更新に失敗しました')
      }
    } catch (e) {
      setStatus('error')
      setErrorMessage('予期せぬエラーが発生しました')
    }
  }

  if (status === 'success') {
    return (
      <Box className="w-full flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="border-border shadow-2xl overflow-hidden bg-background">
            <CardContent className="p-8 text-center">
              <Box className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center text-success mx-auto mb-6">
                <CheckCircle2 size={32} />
              </Box>
              <Heading size="h2" className="text-2xl font-bold text-foreground mb-4">パスワードを更新しました</Heading>
              <Text className="text-muted-foreground mb-8 leading-relaxed">
                新しいパスワードの設定が完了しました。<br />
                トップページへ移動します...
              </Text>
              <Box className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-success"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3 }}
                />
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
            <Heading size="h1" className="text-3xl font-black text-foreground mb-3">パスワード更新</Heading>
            <Text className="text-muted-foreground leading-relaxed">
              新しいパスワードを設定してください。
            </Text>
          </Box>

          <Card className="border-border shadow-xl bg-background overflow-hidden">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit}>
                <Stack className="gap-6">
                  <Stack className="gap-2">
                    <Label htmlFor="password">新しいパスワード</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="8文字以上"
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
                        <Save size={18} />
                        設定を保存する
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
