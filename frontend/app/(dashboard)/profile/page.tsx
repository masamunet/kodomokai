import { createClient } from '@/lib/supabase/server'
import { ProfileScreen } from '@/components/screens/Profile'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = user ? await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() : { data: null }

  const { data: children } = user ? await supabase
    .from('children')
    .select('*')
    .eq('parent_id', user.id)
    .order('birthday', { ascending: false }) : { data: null }

  return (
    <ProfileScreen
      user={user}
      profile={profile}
      initialChildren={children}
    />
  )
}
