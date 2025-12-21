'use client'

import { useState, useRef } from 'react'
import { Button } from '@/ui/primitives/Button'
import { Stack, HStack } from '@/ui/layout/Stack'
import { Heading } from '@/ui/primitives/Heading'
import { Text } from '@/ui/primitives/Text'
import { Badge } from '@/ui/primitives/Badge'
import { Printer, FileText, Calendar, Users, Briefcase, Book } from 'lucide-react'
import { useRouter } from 'next/navigation'

// Standard UI Patterns
import { AdminPage } from '@/components/admin/patterns/AdminPage'
import { Box } from '@/ui/layout/Box'
// We are mimicking ClickableListItem but with a click handler instead of href, 
// OR we use ClickableListItem and preventDefault. 
// However, ClickableListItem forces Link. 
// Let's create a local List Item component that matches ClickableListItem visuals but for button behavior.

// Components
import { GeneralAssemblyCover } from './GeneralAssemblyCover'
import AnnualScheduleEditor from '@/components/admin/AnnualScheduleEditor'
import AccountingEditor from '@/components/admin/accounting/AccountingEditor'
import { NextYearOfficerScreen } from '@/components/screens/admin/officers/NextYearOfficerScreen'
import ConstitutionEditor from '@/components/admin/ConstitutionEditor'

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
}

type PrintTarget =
  | 'none'
  | 'cover'
  | 'activity_report'
  | 'settlement_report'
  | 'officer_list'
  | 'next_activity_plan'
  | 'next_budget_plan'
  | 'constitution'

export function GeneralAssemblyHub({
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
  constitution
}: Props) {
  const router = useRouter()
  const [printTarget, setPrintTarget] = useState<PrintTarget>('none')
  const printingRef = useRef(false)

  const handlePrint = (target: PrintTarget) => {
    setPrintTarget(target)
    printingRef.current = true

    setTimeout(() => {
      window.print()
      printingRef.current = false
    }, 100)
  }

  const getPrintClass = (target: PrintTarget) => {
    return printTarget === target ? 'hidden print:block' : 'hidden'
  }

  return (
    // Replaced custom layout with AdminPage layout
    <AdminPage.Root>
      {/* Screen UI */}
      <Box className="print:hidden">
        <AdminPage.Header
          title="総会資料作成"
          description="総会に必要な資料を一括で作成・印刷できます。各項目の「印刷」ボタンをクリックしてください。"
        />

        <AdminPage.Content>
          <Stack className="gap-3">
            <PrintListItem
              number={1}
              title="表紙"
              icon={<FileText className="w-5 h-5" />}
              description={`${settings?.name || ''} 総会資料`}
              onClick={() => handlePrint('cover')}
            />
            <PrintListItem
              number={2}
              title="活動報告書"
              icon={<Calendar className="w-5 h-5" />}
              description={`${targetFiscalYear}年度`}
              onClick={() => handlePrint('activity_report')}
            />
            <PrintListItem
              number={3}
              title="決算報告書"
              icon={<Briefcase className="w-5 h-5" />}
              description={`${targetFiscalYear}年度 決算・監査`}
              onClick={() => handlePrint('settlement_report')}
              status={!settlementReport ? 'missing' : 'ready'}
            />
            <PrintListItem
              number={4}
              title="役員名簿"
              icon={<Users className="w-5 h-5" />}
              description={`${nextFiscalYear}年度 新役員`}
              onClick={() => handlePrint('officer_list')}
            />
            <PrintListItem
              number={5}
              title="次年度活動予定"
              icon={<Calendar className="w-5 h-5" />}
              description={`${nextFiscalYear}年度 予定案`}
              onClick={() => handlePrint('next_activity_plan')}
            />
            <PrintListItem
              number={6}
              title="次年度予算案"
              icon={<Briefcase className="w-5 h-5" />}
              description={`${nextFiscalYear}年度 予算案`}
              onClick={() => handlePrint('next_budget_plan')}
              status={!budgetReport ? 'missing' : 'ready'}
            />
            <PrintListItem
              number={7}
              title="会則"
              icon={<Book className="w-5 h-5" />}
              description="最新版"
              onClick={() => handlePrint('constitution')}
            />
          </Stack>
        </AdminPage.Content>
      </Box>

      {/* Print Contents Area (Hidden on Screen) */}
      <Box>
        {/* 1. Cover */}
        <div className={getPrintClass('cover')}>
          <GeneralAssemblyCover
            year={targetFiscalYear}
            organizationName={settings?.name}
            eraName={settings?.wareki_era_name}
            startYear={settings?.wareki_start_year}
          />
        </div>

        {/* 2. Activity Report */}
        <div className={getPrintClass('activity_report')}>
          <AnnualScheduleEditor
            year={targetFiscalYear}
            events={currentEvents}
            eraName={settings?.wareki_era_name || '令和'}
            startYear={settings?.wareki_start_year || 2019}
            title="活動報告書"
          />
        </div>

        {/* 3. Settlement Report */}
        <div className={getPrintClass('settlement_report')}>
          {settlementReport && (
            <AccountingEditor
              initialData={settlementReport}
              currentYear={targetFiscalYear}
              accountingInfo={accountingInfoCurrent}
            />
          )}
        </div>

        {/* 4. Officer List */}
        <div className={getPrintClass('officer_list')}>
          <NextYearOfficerScreen
            nextWarekiYear={officerData.nextWarekiYear}
            nextFiscalYear={officerData.nextFiscalYear}
            roles={officerData.roles}
            assignments={officerData.assignments}
            sortedAssignments={officerData.sortedAssignments}
            profiles={officerData.profiles}
          />
        </div>

        {/* 5. Next Activity Plan */}
        <div className={getPrintClass('next_activity_plan')}>
          <AnnualScheduleEditor
            year={nextFiscalYear}
            events={nextEvents}
            eraName={settings?.wareki_era_name || '令和'}
            startYear={settings?.wareki_start_year || 2019}
            title="活動予定案"
          />
        </div>

        {/* 6. Next Budget Report */}
        <div className={getPrintClass('next_budget_plan')}>
          {budgetReport && (
            <AccountingEditor
              initialData={budgetReport}
              currentYear={nextFiscalYear}
              accountingInfo={accountingInfoNext}
            />
          )}
        </div>

        {/* 7. Constitution */}
        <div className={getPrintClass('constitution')}>
          <ConstitutionEditor initialData={constitution} />
        </div>
      </Box>
    </AdminPage.Root>
  )
}

function PrintListItem({ number, title, icon, description, onClick, status = 'ready' }: any) {
  const isDisabled = status === 'missing'

  return (
    <div
      onClick={!isDisabled ? onClick : undefined}
      className={`
        group flex items-center justify-between p-4 border rounded-lg transition-all duration-200
        bg-card border-border
        ${isDisabled
          ? 'opacity-60 cursor-not-allowed bg-muted'
          : 'cursor-pointer hover:bg-muted/50 hover:border-muted-foreground/20 hover:shadow-sm'
        }
      `}
    >
      <HStack className="gap-4 md:gap-6 items-center flex-1">
        <div className={`
           flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold
           ${isDisabled ? 'bg-muted-foreground/10 text-muted-foreground' : 'bg-primary/10 text-primary'}
        `}>
          {number}
        </div>

        <HStack className="gap-3 items-center min-w-[140px]">
          <div className={isDisabled ? 'text-muted-foreground' : 'text-primary'}>
            {icon}
          </div>
          <Heading size="h4" className="text-base font-bold text-foreground">
            {title}
          </Heading>
        </HStack>

        <Text className="text-sm text-muted-foreground hidden sm:block">
          {description}
        </Text>

        {status === 'missing' && (
          <Badge variant="destructive" className="ml-2">未作成</Badge>
        )}
      </HStack>

      <Button
        variant="ghost"
        size="sm"
        disabled={isDisabled}
        className="text-muted-foreground group-hover:text-primary"
      >
        <Printer className="w-4 h-4 mr-2" />
        印刷
      </Button>
    </div>
  )
}
