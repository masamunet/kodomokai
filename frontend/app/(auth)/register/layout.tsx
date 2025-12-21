import { ReactNode } from 'react'
import { getOrganizationSettings } from '@/app/actions/organization'
import { RegisterLayout as Layout } from '@/components/layouts/RegisterLayout'

export default async function RegisterLayout({ children }: { children: ReactNode }) {
  const orgSettings = await getOrganizationSettings()
  const orgName = orgSettings?.name || '子ども会'

  return <Layout orgName={orgName}>{children}</Layout>
}
