import { ReactNode } from 'react'
import { Box } from '@/ui/layout/Box'
import { Stack } from '@/ui/layout/Stack'
import { Heading } from '@/ui/primitives/Heading'
import { Text } from '@/ui/primitives/Text'

type Props = {
  children: ReactNode
  orgName: string
}

export function RegisterLayout({ children, orgName }: Props) {
  return (
    <Box className="min-h-screen bg-muted/30 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Stack className="items-center sm:mx-auto sm:w-full sm:max-w-md gap-2 mb-8">
        <Heading size="h2" className="text-3xl font-black text-foreground text-center">
          新規会員登録
        </Heading>
        <Text className="text-center text-sm text-muted-foreground">
          {orgName}への入会、ありがとうございます。
        </Text>
      </Stack>

      <Box className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <Box className="bg-background py-8 px-4 shadow-xl border border-border sm:rounded-xl sm:px-10">
          {children}
        </Box>
      </Box>
    </Box>
  )
}
