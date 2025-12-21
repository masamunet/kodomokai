import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Heading } from '@/ui/primitives/Heading'
import { Text } from '@/ui/primitives/Text'
import { Box } from '@/ui/layout/Box'
import { HStack } from '@/ui/layout/Stack'
import { Button } from '@/ui/primitives/Button'

interface AdminPageHeaderProps {
  title: string
  description?: string
  action?: {
    label: string
    href: string
  }
}

export default function AdminPageHeader({ title, description, action }: AdminPageHeaderProps) {
  return (
    <Box className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
      <Box>
        <Heading size="h1" className="text-2xl font-bold text-foreground">{title}</Heading>
        {description && (
          <Text className="mt-2 text-sm text-muted-foreground block">
            {description}
          </Text>
        )}
      </Box>
      {action && (
        <Button asChild activeScale={true} className="gap-2">
          <Link href={action.href}>
            <Plus className="h-4 w-4" />
            {action.label}
          </Link>
        </Button>
      )}
    </Box>
  )
}
