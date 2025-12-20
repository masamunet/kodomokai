import SingleEventForm from '@/components/admin/SingleEventForm'
import AdminFormLayout from '@/components/admin/AdminFormLayout'

export default function NewEventPage() {
  return (
    <AdminFormLayout
      title="イベント新規作成"
      backLink={{ href: '/admin/events', label: 'イベント一覧に戻る' }}
    >
      <SingleEventForm />
    </AdminFormLayout>
  )
}
