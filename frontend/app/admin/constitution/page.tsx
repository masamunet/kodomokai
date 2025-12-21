import { getConstitution } from '@/app/admin/actions/constitution'
import { ConstitutionScreen } from '@/components/screens/admin/constitution/ConstitutionScreen'

export const dynamic = 'force-dynamic'

export default async function ConstitutionPage() {
  const constitution = await getConstitution()

  return <ConstitutionScreen constitution={constitution} />
}
