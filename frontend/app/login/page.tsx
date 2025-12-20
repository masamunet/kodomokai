import AuthForm from './AuthForm'
import { getOrganizationSettings } from '@/app/actions/organization'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/')
  }

  const settings = await getOrganizationSettings()
  const orgName = settings?.name || '子供会 管理アプリ'

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <AuthForm orgName={orgName} />
    </div>
  )
}
