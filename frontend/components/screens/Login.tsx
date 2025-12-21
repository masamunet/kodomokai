'use client'

import { useState } from 'react'
import Link from 'next/link'
import { login, signup, signInWithGoogle } from '@/app/login/actions'
import { Box } from '@/ui/layout/Box'
import { Stack, HStack } from '@/ui/layout/Stack'
import { Text } from '@/ui/primitives/Text'
import { Heading } from '@/ui/primitives/Heading'
import { Button } from '@/ui/primitives/Button'
import { Input } from '@/ui/primitives/Input'
import { Label } from '@/ui/primitives/Label'
import { Card, CardHeader, CardContent } from '@/ui/primitives/Card'

export function LoginScreen({ orgName = '子供会 管理アプリ' }: { orgName?: string }) {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <Box className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-border bg-background">
        <CardHeader className="space-y-1 text-center pb-8">
          <Heading size="h2" className="text-2xl font-bold tracking-tight">{orgName}</Heading>
          <Text className="text-sm text-muted-foreground">
            {isLogin ? 'アカウントにログインする' : '新しくアカウントを作成する'}
          </Text>
        </CardHeader>
        <CardContent>
          <Stack className="gap-6">
            <Button
              variant="outline"
              onClick={() => signInWithGoogle()}
              className="w-full gap-3 h-11 font-semibold border-border hover:bg-muted/50 transition-colors"
              activeScale={true}
            >
              <GoogleIcon />
              Googleで{isLogin ? 'ログイン' : '登録'}
            </Button>

            <HStack className="items-center gap-4">
              <Box className="h-px flex-1 bg-border" />
              <Text className="text-xs text-muted-foreground uppercase">または</Text>
              <Box className="h-px flex-1 bg-border" />
            </HStack>

            <form className="space-y-4">
              <Stack className="gap-4">
                {!isLogin && (
                  <Stack className="gap-4">
                    <Box>
                      <Label className="mb-1.5 block">お名前 <Text asChild className="text-destructive">*</Text></Label>
                      <HStack className="gap-2">
                        <Input name="last_name" placeholder="苗字" required className="flex-1" />
                        <Input name="first_name" placeholder="名前" required className="flex-1" />
                      </HStack>
                    </Box>
                    <Box>
                      <Label className="mb-1.5 block">ふりがな</Label>
                      <HStack className="gap-2">
                        <Input name="last_name_kana" placeholder="みょうじ" className="flex-1" />
                        <Input name="first_name_kana" placeholder="なまえ" className="flex-1" />
                      </HStack>
                    </Box>
                  </Stack>
                )}

                <Box>
                  <Label htmlFor="email" className="mb-1.5 block">メールアドレス</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="mail@example.com"
                  />
                </Box>

                <Box>
                  <Label htmlFor="password" className="mb-1.5 block">パスワード</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    required
                    placeholder="••••••••"
                  />
                </Box>
              </Stack>

              {isLogin && (
                <Box className="flex justify-end">
                  <Button variant="link" size="sm" asChild className="p-0 h-auto text-xs">
                    <Link href="/forgot-password">パスワードを忘れた場合</Link>
                  </Button>
                </Box>
              )}

              <Button
                formAction={isLogin ? login : signup}
                className="w-full h-11 font-bold shadow-sm"
                activeScale={true}
              >
                {isLogin ? 'ログイン' : '登録する'}
              </Button>
            </form>

            <Box className="text-center pt-2">
              {isLogin ? (
                <Text className="text-sm text-muted-foreground">
                  まだアカウントをお持ちでない方は{' '}
                  <Button variant="link" size="sm" asChild className="p-0 h-auto font-bold">
                    <Link href="/register">入会はこちら</Link>
                  </Button>
                </Text>
              ) : (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setIsLogin(true)}
                  className="h-auto font-bold"
                >
                  すでにアカウントをお持ちの方はこちら
                </Button>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}
