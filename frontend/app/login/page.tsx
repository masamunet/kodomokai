import AuthForm from './AuthForm'
import { getOrganizationSettings } from '@/app/actions/organization'

export default async function LoginPage() {
  const settings = await getOrganizationSettings()
  const orgName = settings?.name || '子供会 管理アプリ'

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <AuthForm orgName={orgName} />
    </div>
  )
}
