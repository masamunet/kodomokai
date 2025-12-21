import { createClient } from '@/lib/supabase/server'
import { NotificationListScreen } from '@/components/screens/admin/notifications/NotificationListScreen'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*, notification_recipients(count)')
    .order('sent_at', { ascending: false })

  return <NotificationListScreen notifications={notifications || []} />
}
