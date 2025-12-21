import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NewChildScreen } from '@/components/screens/NewChild'

export default async function NewChildPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('last_name, last_name_kana')
    .eq('id', user.id)
    .single()

  return (
    <NewChildScreen
      initialLastName={profile?.last_name || ''}
      initialLastNameKana={profile?.last_name_kana || ''}
    />
  )
}
