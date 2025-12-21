import RegistrationWizard from '@/components/registration/onboarding/RegistrationWizard'
import { getOrganizationSettings } from '@/app/admin/actions/settings'

export default async function RegisterPage() {
  const settings = await getOrganizationSettings()

  return (
    <RegistrationWizard
      admissionFee={settings?.admission_fee ?? 0}
      annualFee={settings?.annual_fee ?? 0}
    />
  )
}
