'use client'

import ChildForm from './profile/children/new/ChildForm'
import { Box } from '@/ui/layout/Box'
import { Stack } from '@/ui/layout/Stack'
import { Heading } from '@/ui/primitives/Heading'

interface NewChildScreenProps {
  initialLastName: string
  initialLastNameKana: string
}

export function NewChildScreen({ initialLastName, initialLastNameKana }: NewChildScreenProps) {
  return (
    <Box className="min-h-screen bg-muted/30 p-4 sm:p-8">
      <Box className="mx-auto max-w-2xl bg-background shadow-sm border border-border sm:rounded-xl p-6 sm:p-8">
        <Stack className="gap-8">
          <Heading size="h2" className="text-2xl font-bold text-foreground">お子様の追加</Heading>
          <ChildForm
            initialLastName={initialLastName}
            initialLastNameKana={initialLastNameKana}
          />
        </Stack>
      </Box>
    </Box>
  )
}
