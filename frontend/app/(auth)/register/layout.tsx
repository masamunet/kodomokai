import { ReactNode } from 'react'
import { getOrganizationSettings } from '@/app/actions/organization'

export default async function RegisterLayout({ children }: { children: ReactNode }) {
  const orgSettings = await getOrganizationSettings()
  const orgName = orgSettings?.name || '子ども会'

  // A clean layout without the standard dashboard header/sidebar
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          新規会員登録
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {orgName}への入会、ありがとうございます。
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {children}
        </div>
      </div>
    </div>
  )
}
