import { Box } from '@/ui/layout/Box'
import { Stack, HStack } from '@/ui/layout/Stack'
import { Text } from '@/ui/primitives/Text'
import { Heading } from '@/ui/primitives/Heading'
import { AdminPage } from '@/components/admin/patterns/AdminPage'
import { ClickableListItem } from '@/components/admin/patterns/ClickableListItem'
import { Badge } from '@/ui/primitives/Badge'
import { Button } from '@/ui/primitives/Button'
import { Edit2 } from 'lucide-react'

interface AccountingListScreenProps {
  reports: any[]
  currentYear: number
}

export function AccountingListScreen({ reports, currentYear }: AccountingListScreenProps) {
  return (
    <AdminPage.Root>
      <AdminPage.Header
        title="会計報告"
        description="決算報告書および予算案の管理"
        action={{ label: '新規作成', href: '/admin/accounting/new' }}
      />

      <AdminPage.Content>
        <Stack className="gap-4">
          {reports.length === 0 ? (
            <Box className="bg-muted/10 border border-dashed border-border p-16 rounded-xl text-center">
              <Text className="text-muted-foreground">会計報告がまだありません。「新規作成」から始めましょう。</Text>
            </Box>
          ) : (
            reports.map((report) => (
              <ClickableListItem
                key={report.id}
                href={`/admin/accounting/${report.id}/edit`}
              >
                <HStack className="items-center justify-between">
                  <Stack className="gap-2">
                    <HStack className="gap-2">
                      <Badge variant="secondary">
                        {report.fiscal_year}年度
                      </Badge>
                      <Badge variant={report.report_type === 'settlement' ? 'default' : 'outline'}>
                        {report.report_type === 'settlement' ? '決算報告' : '予算案'}
                      </Badge>
                    </HStack>
                    <Heading size="h3" className="text-lg font-bold text-foreground">
                      {report.title}
                    </Heading>
                    <Text className="text-xs text-muted-foreground">
                      最終更新: {new Date(report.updated_at).toLocaleDateString()}
                    </Text>
                  </Stack>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0 text-muted-foreground group-hover:text-primary transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                    <span className="sr-only">編集</span>
                  </Button>
                </HStack>
              </ClickableListItem>
            ))
          )}
        </Stack>
      </AdminPage.Content>
    </AdminPage.Root>
  )
}
