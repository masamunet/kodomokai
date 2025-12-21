'use client'

import Link from 'next/link'
import ProfileForm from './profile/ProfileForm'
import DeleteChildButton from './profile/DeleteChildButton'
import { Box } from '@/ui/layout/Box'
import { Stack, HStack } from '@/ui/layout/Stack'
import { Text } from '@/ui/primitives/Text'
import { Heading } from '@/ui/primitives/Heading'
import { Button } from '@/ui/primitives/Button'
import { Plus, ChevronLeft } from 'lucide-react'

interface ProfileScreenProps {
  user: any
  profile: any
  initialChildren: any[] | null
}

export function ProfileScreen({ user, profile, initialChildren }: ProfileScreenProps) {
  if (!user) {
    return (
      <Box className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Stack className="items-center gap-6 text-center bg-background p-12 rounded-2xl border border-border shadow-xl max-w-md w-full">
          <Box className="bg-muted/10 p-4 rounded-full">
            <Text className="text-4xl">🔐</Text>
          </Box>
          <Stack className="gap-2">
            <Heading size="h2" className="text-2xl font-bold">アクセス制限</Heading>
            <Text className="text-muted-foreground">このページを表示するにはログインが必要です。</Text>
          </Stack>
          <Button asChild activeScale={true} className="w-full h-12 font-bold text-base shadow-lg">
            <Link href="/login">ログイン画面へ</Link>
          </Button>
        </Stack>
      </Box>
    )
  }

  const children = initialChildren

  return (
    <Box className="min-h-screen bg-muted/30 p-4 sm:p-8">
      <Stack className="mx-auto max-w-3xl gap-8">
        <HStack className="items-center justify-between">
          <Heading size="h1" className="text-2xl font-bold text-foreground">マイページ</Heading>
          <Button variant="link" asChild className="text-primary hover:text-primary/80">
            <Link href="/" className="gap-1">
              <ChevronLeft size={16} /> ダッシュボードへ戻る
            </Link>
          </Button>
        </HStack>

        {/* Profile Section */}
        <Box className="bg-background shadow-sm border border-border sm:rounded-xl overflow-hidden">
          <Box className="px-4 py-5 sm:px-6 border-b border-border bg-muted/10">
            <Heading size="h3" className="text-lg font-bold text-foreground">保護者情報</Heading>
            <Text className="mt-1 text-sm text-muted-foreground">連絡先等の情報を更新できます。</Text>
          </Box>
          <Box className="px-4 py-5 sm:p-8">
            <ProfileForm profile={profile} />
          </Box>
        </Box>

        {/* Children Section */}
        <Box className="bg-background shadow-sm border border-border sm:rounded-xl overflow-hidden">
          <Box className="px-4 py-5 sm:px-6 border-b border-border bg-muted/10 flex justify-between items-center">
            <Box>
              <Heading size="h3" className="text-lg font-bold text-foreground">お子様情報</Heading>
              <Text className="mt-1 text-sm text-muted-foreground">登録されているお子様の一覧です。</Text>
            </Box>
            <Button asChild activeScale={true} className="gap-2 font-bold shadow-md">
              <Link href="/profile/children/new">
                <Plus size={16} />
                お子様を追加
              </Link>
            </Button>
          </Box>
          <Box>
            <Box className="divide-y divide-border">
              {children?.length === 0 ? (
                <Box className="px-4 py-12 text-center">
                  <Text className="text-muted-foreground italic">登録されているお子様はいません</Text>
                </Box>
              ) : (
                children?.map((child) => (
                  <Box key={child.id} className="px-4 py-5 sm:px-8 hover:bg-muted/30 transition-colors">
                    <HStack className="items-center justify-between gap-4">
                      <Stack className="gap-1 flex-1">
                        <Text weight="bold" className="text-lg text-primary">{child.full_name}</Text>
                        <HStack className="text-sm text-muted-foreground gap-2">
                          <Text>{child.gender === 'male' ? '男の子' : child.gender === 'female' ? '女の子' : 'その他'}</Text>
                          <Text className="opacity-30">|</Text>
                          <Text>{child.birthday ? new Date(child.birthday).toLocaleDateString() : '誕生日未登録'}</Text>
                        </HStack>
                        {child.allergies && (
                          <Box className="bg-destructive/10 text-destructive text-xs font-bold px-3 py-1.5 rounded-md mt-2 border border-destructive/20 inline-block w-fit">
                            アレルギー: {child.allergies}
                          </Box>
                        )}
                      </Stack>
                      <DeleteChildButton childId={child.id} />
                    </HStack>
                  </Box>
                ))
              )}
            </Box>
          </Box>
        </Box>
      </Stack>
    </Box>
  )
}
