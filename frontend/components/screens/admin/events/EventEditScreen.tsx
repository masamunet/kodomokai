import SingleEventForm from '@/components/admin/SingleEventForm'
import AdminFormLayout from '@/components/admin/AdminFormLayout'

interface EventEditScreenProps {
  event: any
}

export function EventEditScreen({ event }: EventEditScreenProps) {
  return (
    <AdminFormLayout
      title="イベント編集"
      backLink={{ href: '/admin/events', label: 'イベント一覧に戻る' }}
    >
      <SingleEventForm event={event} />
    </AdminFormLayout>
  )
}
