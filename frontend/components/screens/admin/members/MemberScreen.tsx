import AdminPageHeader from '@/components/admin/AdminPageHeader'
import MemberTabs from '@/components/admin/members/MemberTabs'
import ChildList from '@/components/admin/members/ChildList'
import GuardianList from '@/components/admin/members/GuardianList'
import OfficerList from '@/components/admin/members/OfficerList'
import { Box } from '@/ui/layout/Box'
import { Stack } from '@/ui/layout/Stack'

type ViewType = 'child' | 'guardian' | 'officer'

interface MemberScreenProps {
  view: ViewType
  profiles: any[]
  assignments: any[]
  titleYear: string
  targetFiscalYear: number
  canEdit: boolean
}

export function MemberScreen({
  view,
  profiles,
  assignments,
  titleYear,
  targetFiscalYear,
  canEdit
}: MemberScreenProps) {
  return (
    <Stack className="gap-8">
      <AdminPageHeader
        title="会員名簿"
        description="会員（保護者）、お子様、および役員の名簿を管理します。"
      />

      <Box className="mt-8">
        <MemberTabs />

        {view === 'child' && (
          <ChildList profiles={profiles} targetFiscalYear={targetFiscalYear} canEdit={canEdit} />
        )}

        {view === 'guardian' && (
          <GuardianList profiles={profiles} targetFiscalYear={targetFiscalYear} canEdit={canEdit} />
        )}

        {view === 'officer' && (
          <OfficerList assignments={assignments} titleYear={titleYear} />
        )}
      </Box>
    </Stack>
  )
}
