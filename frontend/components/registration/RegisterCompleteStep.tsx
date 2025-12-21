import { useState, useEffect } from 'react'
import { RegistrationData } from '@/components/registration/onboarding/RegistrationWizard'
import { completeRegistration } from '@/app/actions/auth'
import Link from 'next/link'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Box } from '@/ui/layout/Box'
import { Stack } from '@/ui/layout/Stack'
import { Text } from '@/ui/primitives/Text'
import { Heading } from '@/ui/primitives/Heading'
import { Button } from '@/ui/primitives/Button'

type Props = {
  data: RegistrationData
}

export default function RegisterCompleteStep({ data }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const submit = async () => {
      setStatus('loading')
      try {
        const result = await completeRegistration(data)
        if (result.success) {
          setStatus('success')
        } else {
          setStatus('error')
          setErrorMessage(result.message || '登録処理に失敗しました')
        }
      } catch (e: any) {
        setStatus('error')
        setErrorMessage(e.message || '予期せぬエラーが発生しました')
      }
    }

    if (status === 'idle') {
      submit()
    }
  }, [data, status])

  if (status === 'loading') {
    return (
      <Stack className="items-center justify-center py-12 gap-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <Stack className="gap-1 text-center">
          <Heading size="h3" className="text-lg font-bold">登録処理中...</Heading>
          <Text className="text-sm text-muted-foreground">アカウントとプロフィールを作成しています。</Text>
        </Stack>
      </Stack>
    )
  }

  if (status === 'error') {
    return (
      <Stack className="items-center justify-center py-8 gap-6 text-center">
        <Box className="flex items-center justify-center h-14 w-14 rounded-full bg-destructive/10 text-destructive">
          <AlertCircle size={32} />
        </Box>
        <Stack className="gap-2">
          <Heading size="h3" className="text-xl font-bold">登録に失敗しました</Heading>
          <Text className="text-sm text-muted-foreground max-w-sm mx-auto">{errorMessage}</Text>
        </Stack>
        <Button
          onClick={() => window.location.reload()}
          className="px-8 h-11 font-bold shadow-md"
          activeScale={true}
        >
          やり直す
        </Button>
      </Stack>
    )
  }

  return (
    <Stack className="items-center justify-center py-8 gap-8 text-center">
      <Box className="flex items-center justify-center h-20 w-20 rounded-full bg-green-100 text-green-600 shadow-sm border border-green-200">
        <CheckCircle size={48} />
      </Box>
      <Stack className="gap-3">
        <Heading size="h2" className="text-3xl font-extrabold tracking-tight">登録完了！</Heading>
        <Text className="text-base text-muted-foreground leading-relaxed">
          これですべての手続きが完了しました。<br />
          ダッシュボードへお進みください。
        </Text>
      </Stack>

      <Box className="w-full max-w-xs pt-4">
        <Button
          asChild
          className="w-full h-12 text-lg font-bold shadow-lg"
          activeScale={true}
        >
          <Link href="/">ダッシュボードへ</Link>
        </Button>
      </Box>
    </Stack>
  )
}
