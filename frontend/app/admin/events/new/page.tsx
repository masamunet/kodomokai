import Link from 'next/link'
import EventForm from './EventForm'
import AdminFormLayout from '@/components/admin/AdminFormLayout'

export default function NewEventPage() {
  return (
    <AdminFormLayout
      title="イベント新規作成"
      backLink={{ href: '/admin/events', label: 'イベント一覧に戻る' }}
    >
      <EventForm />
    </AdminFormLayout>
  )
}
