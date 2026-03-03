import SettingsForm from '@/components/admin/settings/SettingsForm'
import AnnualSettingsForm from '@/components/admin/settings/AnnualSettingsForm'
import { Box } from '@/ui/layout/Box'
import { Stack } from '@/ui/layout/Stack'
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
  initialAnnualData: {
    fiscalYear: number
    invitationCode: string
  }
}

export function SettingsScreen({ initialData, initialAnnualData }: SettingsScreenProps) {
  return (
    <Box className="max-w-3xl mx-auto py-6">
      <Stack className="gap-8">
        <Box>
          <Heading size="h2" className="text-xl font-semibold mb-6">年度別設定 ({initialAnnualData.fiscalYear}年度)</Heading>
          <AnnualSettingsForm
            fiscalYear={initialAnnualData.fiscalYear}
            initialInvitationCode={initialAnnualData.invitationCode}
          />
        </Box>

        <Box>
          <Heading size="h2" className="text-xl font-semibold mb-6">基本設定</Heading>
          <SettingsForm
            initialName={initialData.name}
            initialStartMonth={initialData.startMonth}
            initialWarekiEraName={initialData.warekiEraName}
            initialWarekiStartYear={initialData.warekiStartYear}
            initialAdmissionFee={initialData.admissionFee}
            initialAnnualFee={initialData.annualFee}
          />
        </Box>
      </Stack>
    </Box>
  )
}
