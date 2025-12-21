
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Box } from '@/ui/layout/Box'
import { Text } from '@/ui/primitives/Text'

export default async function ReadPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> // Dynamic API requires promise in v15, handling similarly for forward compatibility
}) {
  const params = await searchParams
  const token = params.token as string

  if (!token) {
    return (
      <Box className="p-8 text-center">
        <Text>Invalid Link</Text>
      </Box>
    )
  }

  const supabase = await createClient()

  // Call the secure RPC function to mark as read
  const { data: success, error } = await supabase.rpc('mark_notification_read_by_token', {
    token: token,
  })

  if (error || !success) {
    console.error('Error marking as read:', error)
    return (
      <Box className="p-8 text-center">
        <Text>Error or Invalid Token</Text>
      </Box>
    )
  }

  // Redirect to dashboard or a "Thank you" page
  // For now, redirect to dashboard showing the notification content could be nice, but simple redirect is fine
  redirect('/')
}
