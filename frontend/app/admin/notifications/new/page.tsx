import { createClient } from '@/lib/supabase/server'
import { NotificationAddScreen } from '@/components/screens/admin/notifications/NotificationAddScreen'

export default async function NewNotificationPage() {
  const supabase = await createClient()
  const { data: templates } = await supabase.from('notification_templates').select('*')

  return <NotificationAddScreen templates={templates || []} />
}
