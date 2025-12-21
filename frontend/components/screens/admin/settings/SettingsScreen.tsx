import SettingsForm from '@/components/admin/settings/SettingsForm'
import { Box } from '@/ui/layout/Box'
import { Heading } from '@/ui/primitives/Heading'

interface SettingsScreenProps {
  initialData: {
    name: string
    startMonth: number
    warekiEraName: string
    warekiStartYear: number
    admissionFee: number
    annualFee: number
  }
}

export function SettingsScreen({ initialData }: SettingsScreenProps) {
  return (
    <Box className="max-w-2xl mx-auto">
      <Heading size="h2" className="text-xl font-semibold mb-6">会の設定</Heading>
      <SettingsForm
        initialName={initialData.name}
        initialStartMonth={initialData.startMonth}
        initialWarekiEraName={initialData.warekiEraName}
        initialWarekiStartYear={initialData.warekiStartYear}
        initialAdmissionFee={initialData.admissionFee}
        initialAnnualFee={initialData.annualFee}
      />
    </Box>
  )
}
