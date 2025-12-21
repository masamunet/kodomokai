import AccountingEditor from '@/components/admin/accounting/AccountingEditor'
import { Box } from '@/ui/layout/Box'
import { Heading } from '@/ui/primitives/Heading'
import { Text } from '@/ui/primitives/Text'

interface AccountingAddScreenProps {
  currentYear: number
  accountingInfo: any
}

export function AccountingAddScreen({ currentYear, accountingInfo }: AccountingAddScreenProps) {
  return (
    <Box className="max-w-6xl mx-auto space-y-6">
      <div className="print:hidden">
        <Heading size="h1" className="text-3xl font-bold tracking-tight text-foreground">会計報告の作成</Heading>
        <Text className="text-muted-foreground text-sm">項目を入力して、決算報告書または予算案を作成します</Text>
      </div>

      <AccountingEditor currentYear={currentYear} accountingInfo={accountingInfo} />
    </Box>
  )
}
