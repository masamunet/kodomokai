import TemplateForm from '@/components/admin/templates/TemplateForm'
import AdminFormLayout from '@/components/admin/AdminFormLayout'

export function TemplateAddScreen() {
  return (
    <AdminFormLayout
      title="テンプレートの作成"
      backLink={{ href: '/admin/templates', label: '一覧に戻る' }}
    >
      <TemplateForm />
    </AdminFormLayout>
  )
}
