import AccountingEditor from '@/components/admin/accounting/AccountingEditor'
import { Box } from '@/ui/layout/Box'
import { Heading } from '@/ui/primitives/Heading'
import { Text } from '@/ui/primitives/Text'

interface AccountingEditScreenProps {
  report: any
  currentYear: number
  accountingInfo: any
}

export function AccountingEditScreen({ report, currentYear, accountingInfo }: AccountingEditScreenProps) {
  return (
    <Box className="max-w-6xl mx-auto space-y-6">
      <div className="print:hidden">
        <Heading size="h1" className="text-3xl font-bold tracking-tight text-foreground">会計報告の編集</Heading>
        <Text className="text-muted-foreground text-sm">{report.title} の内容を編集します</Text>
      </div>

      <AccountingEditor initialData={report} currentYear={currentYear} accountingInfo={accountingInfo} />
    </Box>
  )
}
