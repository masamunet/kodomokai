import Link from 'next/link'
import TemplateForm from './TemplateForm'
import AdminFormLayout from '@/components/admin/AdminFormLayout'

export default function NewTemplatePage() {
  return (
    <AdminFormLayout
      title="テンプレート新規作成"
      backLink={{ href: '/admin/templates', label: 'テンプレート一覧に戻る' }}
    >
      <TemplateForm />
    </AdminFormLayout>
  )
}
