import AdminPageHeader from '@/components/admin/AdminPageHeader'
import ConstitutionEditor from '@/components/admin/ConstitutionEditor'
import { Box } from '@/ui/layout/Box'

interface ConstitutionScreenProps {
  constitution: any
}

export function ConstitutionScreen({ constitution }: ConstitutionScreenProps) {
  return (
    <Box className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="print:hidden">
        <AdminPageHeader
          title="規約管理"
          description="会の規約を編集・管理します。Markdown形式で記述でき、PDFとして出力・印刷が可能です。"
        />
      </div>

      <Box className="mt-8">
        <ConstitutionEditor initialData={constitution} />
      </Box>
    </Box>
  )
}
