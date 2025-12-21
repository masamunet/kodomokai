import NotificationForm from '@/components/admin/notifications/NotificationForm'
import AdminFormLayout from '@/components/admin/AdminFormLayout'

interface NotificationAddScreenProps {
  templates: any[]
}

export function NotificationAddScreen({ templates }: NotificationAddScreenProps) {
  return (
    <AdminFormLayout
      title="お知らせ配信"
      backLink={{ href: '/admin/notifications', label: '配信一覧に戻る' }}
    >
      <NotificationForm templates={templates} />
    </AdminFormLayout>
  )
}
