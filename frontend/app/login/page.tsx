import { getOrganizationSettings } from '@/app/actions/organization'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LoginScreen } from '@/components/screens/Login'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/')
  }

  const settings = await getOrganizationSettings()
  const orgName = settings?.name || '子供会 管理アプリ'

  return <LoginScreen orgName={orgName} />
}
