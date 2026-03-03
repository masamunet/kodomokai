'use client'

import { useState } from 'react'
import { Button } from '@/ui/primitives/Button'
import { Stack, HStack } from '@/ui/layout/Stack'
import { Heading } from '@/ui/primitives/Heading'
import { Text } from '@/ui/primitives/Text'
import { Badge } from '@/ui/primitives/Badge'
import { ArrowLeft, FileText, Calendar, Users, Briefcase, Book, Printer } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

// Components (Reused from Admin)
import { GeneralAssemblyCover } from '@/components/screens/admin/general-assembly/GeneralAssemblyCover'
import AnnualScheduleEditor from '@/components/admin/AnnualScheduleEditor'
import AccountingEditor from '@/components/admin/accounting/AccountingEditor'
import { NextYearOfficerScreen } from '@/components/screens/admin/officers/NextYearOfficerScreen'
import ConstitutionEditor from '@/components/admin/ConstitutionEditor'
import { Box } from '@/ui/layout/Box'

type Props = {
  targetFiscalYear: number
  nextFiscalYear: number
  settings: any
  currentEvents: any[]
  nextEvents: any[]
  settlementReport: any
  budgetReport: any
  accountingInfoCurrent: any
  accountingInfoNext: any
  officerData: any
  constitution: any
  distributedMaterials: Record<string, boolean>
}

type MaterialType =
  | 'cover'
  | 'activity_report'
  | 'settlement_report'
  | 'officer_list'
  | 'next_activity_plan'
  | 'next_budget_plan'
  | 'constitution'

const MATERIAL_LABELS: Record<string, string> = {
  cover: '表紙',
  activity_report: '活動報告書',
  settlement_report: '決算報告書',
  officer_list: '役員名簿',
  next_activity_plan: '次年度活動予定',
  next_budget_plan: '次年度予算案',
  constitution: '会則',
}

const MATERIAL_ICONS: Record<string, any> = {
  cover: FileText,
  activity_report: Calendar,
  settlement_report: Briefcase,
  officer_list: Users,
  next_activity_plan: Calendar,
  next_budget_plan: Briefcase,
  constitution: Book,
}

export function MemberGeneralAssemblyScreen({
  targetFiscalYear,
  nextFiscalYear,
  settings,
  currentEvents,
  nextEvents,
  settlementReport,
  budgetReport,
  accountingInfoCurrent,
  accountingInfoNext,
  officerData,
  constitution,
  distributedMaterials
}: Props) {
  const router = useRouter()
  // Use 'tab' query param to manage view state if needed, or simple local state
  // Let's use simple local state for simplicity, defaults to 'cover' if available, otherwise first available
  const availableMaterials = Object.keys(MATERIAL_LABELS).filter(k => distributedMaterials[k])
  const [selectedMaterial, setSelectedMaterial] = useState<string>(availableMaterials[0] || 'none')

  if (availableMaterials.length === 0) {
    return (
      <Box className="p-8 text-center bg-muted/20 rounded-xl border border-dashed border-border">
        <Heading size="h3" className="text-muted-foreground mb-2">総会資料は公開されていません</Heading>
        <Text className="text-muted-foreground">役員による資料の公開をお待ちください。</Text>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/">ダッシュボードへ戻る</Link>
        </Button>
      </Box>
    )
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <Box className="container mx-auto py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-64 flex-shrink-0 print:hidden space-y-6">
          <Button variant="ghost" size="sm" asChild className="pl-0 gap-2 mb-2 text-muted-foreground hover:text-primary">
            <Link href="/">
              <ArrowLeft size={16} /> ダッシュボードへ戻る
            </Link>
          </Button>

          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 bg-muted/30 border-b border-border">
              <Text weight="bold" className="text-foreground">総会資料一覧</Text>
            </div>
            <div className="p-2 space-y-1">
              {Object.entries(MATERIAL_LABELS).map(([key, label], idx) => {
                const isDistributed = distributedMaterials[key]
                const Icon = MATERIAL_ICONS[key]
                if (!isDistributed) return null

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedMaterial(key)}
                    className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left
                    ${selectedMaterial === key
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }
                  `}
                  >
                    <div className={`
                    flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0
                    ${selectedMaterial === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
                  `}>
                      {idx + 1}
                    </div>
                    <span className="flex-1">{label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          <div className="bg-card border border-border rounded-xl shadow-sm min-h-[500px] overflow-hidden print:border-none print:shadow-none print:rounded-none">
            <div className="border-b border-border p-4 flex justify-between items-center bg-muted/10 print:hidden">
              <Heading size="h3" className="font-bold flex items-center gap-2">
                {MATERIAL_ICONS[selectedMaterial] && <IconWrapper icon={MATERIAL_ICONS[selectedMaterial]} />}
                {MATERIAL_LABELS[selectedMaterial]}
              </Heading>
              <Button size="sm" variant="outline" onClick={handlePrint} className="gap-2">
                <Printer size={16} /> 印刷
              </Button>
            </div>

            <div className="p-6 md:p-10 print:p-0">
              {selectedMaterial === 'cover' && (
                <GeneralAssemblyCover
                  year={targetFiscalYear}
                  organizationName={settings?.name}
                  eraName={settings?.wareki_era_name}
                  startYear={settings?.wareki_start_year}
                />
              )}
              {selectedMaterial === 'activity_report' && (
                <AnnualScheduleEditor
                  year={targetFiscalYear}
                  events={currentEvents}
                  eraName={settings?.wareki_era_name || '令和'}
                  startYear={settings?.wareki_start_year || 2019}
                  title="活動報告書"
                  readOnly={true}
                />
              )}
              {selectedMaterial === 'settlement_report' && settlementReport && (
                <AccountingEditor
                  initialData={settlementReport}
                  currentYear={targetFiscalYear}
                  accountingInfo={accountingInfoCurrent}
                  readOnly={true}
                />
              )}
              {selectedMaterial === 'officer_list' && (
                <NextYearOfficerScreen
                  nextWarekiYear={officerData.nextWarekiYear}
                  nextFiscalYear={officerData.nextFiscalYear}
                  roles={officerData.roles}
                  assignments={officerData.assignments}
                  sortedAssignments={officerData.sortedAssignments}
                  profiles={officerData.profiles}
                  readOnly={true}
                />
              )}
              {selectedMaterial === 'next_activity_plan' && (
                <AnnualScheduleEditor
                  year={nextFiscalYear}
                  events={nextEvents}
                  eraName={settings?.wareki_era_name || '令和'}
                  startYear={settings?.wareki_start_year || 2019}
                  title="活動予定案"
                  readOnly={true}
                />
              )}
              {selectedMaterial === 'next_budget_plan' && budgetReport && (
                <AccountingEditor
                  initialData={budgetReport}
                  currentYear={nextFiscalYear}
                  accountingInfo={accountingInfoNext}
                  readOnly={true}
                />
              )}
              {selectedMaterial === 'constitution' && (
                <ConstitutionEditor
                  initialData={constitution}
                  readOnly={true}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </Box>
  )
}

function IconWrapper({ icon: Icon }: { icon: any }) {
  return <Icon className="w-5 h-5 text-primary" />
}
