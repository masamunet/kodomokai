import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReadScreen } from '@/components/screens/notifications/Read'

export default async function ReadPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const token = params.token as string

  if (!token) {
    return <ReadScreen error="無効なリンクです" />
  }

  const supabase = await createClient()

  const { data: success, error } = await supabase.rpc('mark_notification_read_by_token', {
    token: token,
  })

  if (error || !success) {
    console.error('Error marking as read:', error)
    return <ReadScreen error="エラーが発生したか、無効なトークンです" />
  }

  redirect('/')
}
