import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import NotificationForm from './NotificationForm'
import AdminFormLayout from '@/components/admin/AdminFormLayout'

export default async function NewNotificationPage() {
  const supabase = await createClient()
  const { data: templates } = await supabase.from('notification_templates').select('*')

  return (
    <AdminFormLayout
      title="お知らせ配信"
      backLink={{ href: '/admin/notifications', label: '配信一覧に戻る' }}
    >
      <NotificationForm templates={templates || []} />
    </AdminFormLayout>
  )
}
