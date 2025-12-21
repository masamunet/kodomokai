'use client';

import { useState } from 'react'
import MemberTabs from '@/components/admin/members/MemberTabs'
import ChildList from '@/components/admin/members/ChildList'
import GuardianList from '@/components/admin/members/GuardianList'
import OfficerList from '@/components/admin/members/OfficerList'
import { Box } from '@/ui/layout/Box'
import { AdminPage } from '@/components/admin/patterns/AdminPage'
import { Button } from '@/ui/primitives/Button'
import { BarChart3 } from 'lucide-react'
import { MemberStatisticsModal } from '@/components/admin/members/MemberStatisticsModal'

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
  const [isStatsOpen, setIsStatsOpen] = useState(false)

  return (
    <AdminPage.Root>
      <AdminPage.Header
        title="会員名簿"
        description="会員（保護者）、お子様、および役員の名簿を管理します。"
      />

      <AdminPage.Content>
        <MemberTabs>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsStatsOpen(true)}
            className="gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            統計情報を表示
          </Button>
        </MemberTabs>

        <Box className="mt-4">
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

        <MemberStatisticsModal
          isOpen={isStatsOpen}
          onOpenChange={setIsStatsOpen}
          profiles={profiles}
          targetFiscalYear={targetFiscalYear}
        />
      </AdminPage.Content>
    </AdminPage.Root>
  )
}
