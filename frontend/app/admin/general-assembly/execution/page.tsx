'use client'

import { AdminPage } from '@/components/admin/patterns/AdminPage'
import { ExecutionPlaceholder } from '@/components/screens/admin/general-assembly/ExecutionPlaceholder'

export default function GeneralAssemblyExecutionPage() {
  return (
    <AdminPage.Root>
      <AdminPage.Header
        title="総会執行"
        description="総会の当日の進行管理や、出欠確認、採決の結果入力などを行うことができます（現在準備中です）。"
      />

      <AdminPage.Content>
        <ExecutionPlaceholder />
      </AdminPage.Content>
    </AdminPage.Root>
  )
}
