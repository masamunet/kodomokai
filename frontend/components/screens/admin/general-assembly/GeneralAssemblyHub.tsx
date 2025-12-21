'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/ui/primitives/Button'
import { Card } from '@/ui/primitives/Card' // Assuming Card exists or use Box/div
import { Box } from '@/ui/layout/Box'
import { Stack, HStack } from '@/ui/layout/Stack'
import { Heading } from '@/ui/primitives/Heading'
import { Text } from '@/ui/primitives/Text'
import { Printer, FileText, Calendar, Users, Briefcase, Book } from 'lucide-react'
import { useRouter } from 'next/navigation'

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

  // Ref to track if we just triggered a print
  const printingRef = useRef(false)

  const handlePrint = (target: PrintTarget) => {
    setPrintTarget(target)
    printingRef.current = true

    // Allow React to render the target block, then print
    setTimeout(() => {
      window.print()
      // Reset after print dialog closes (or reasonably soon)
      // Note: window.print() is blocking in many browsers but not all.
      // We'll reset target after a delay or on focus back execution, 
      // but keeping it 'none' requires logic. 
      // Better to keep the state until user changes it or we reset it manually?
      // Resetting manually after delay is safer to avoid "stuck" print view if user cancels.
      // However, if we reset too early, print preview might lose content.
      // The CSS `print:block` vs `hidden` relies on this state.
      // Actually, standard practice: keep the state. The user can click another button.
      // But we want to hide it from SCRREN view immediately? 
      // The logic is: Screen view shows buttons. Print view shows content.
      // So on Screen, content is always hidden (className="hidden print:block").
      // Wait, if it is "hidden", it won't be printed?
      // Correct. We need "hidden print:block" BUT only for the ACTIVE target.
      // If target is 'none', everything is hidden print:hidden.

      printingRef.current = false
    }, 100)
  }

  // To ensure we don't accidentally show things on screen, we wrap everything in "hidden print:block" logic.
  // BUT, we need to apply `print:block` ONLY to the selected target.
  const getPrintClass = (target: PrintTarget) => {
    return printTarget === target ? 'hidden print:block' : 'hidden'
  }

  return (
    <Box className="p-6 max-w-5xl mx-auto print:p-0 print:max-w-none">
      {/* Screen UI: Button List */}
      <Box className="print:hidden space-y-8">
        <Box>
          <Heading size="h1" className="text-2xl font-bold mb-2">総会資料作成</Heading>
          <Text className="text-muted-foreground">
            総会に必要な各種資料を印刷できます。以下のボタンを上から順に押して印刷してください。
          </Text>
        </Box>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <PrintCard
            number={1}
            title="表紙"
            icon={<FileText />}
            description={`${settings?.name || ''} 総会資料の表紙`}
            onClick={() => handlePrint('cover')}
          />
          <PrintCard
            number={2}
            title="活動報告書"
            icon={<Calendar />}
            description={`${targetFiscalYear}年度 活動報告`}
            onClick={() => handlePrint('activity_report')}
          />
          <PrintCard
            number={3}
            title="決算報告書"
            icon={<Briefcase />}
            description={`${targetFiscalYear}年度 決算報告・監査報告`}
            onClick={() => handlePrint('settlement_report')}
            disabled={!settlementReport}
            warning={!settlementReport ? 'まだ作成されていません' : undefined}
          />
          <PrintCard
            number={4}
            title="役員名簿"
            icon={<Users />}
            description={`${nextFiscalYear}年度 新役員名簿`}
            onClick={() => handlePrint('officer_list')}
          />
          <PrintCard
            number={5}
            title="次年度活動予定"
            icon={<Calendar />}
            description={`${nextFiscalYear}年度 活動予定案`}
            onClick={() => handlePrint('next_activity_plan')}
          />
          <PrintCard
            number={6}
            title="次年度予算案"
            icon={<Briefcase />}
            description={`${nextFiscalYear}年度 予算案`}
            onClick={() => handlePrint('next_budget_plan')}
            disabled={!budgetReport}
            warning={!budgetReport ? 'まだ作成されていません' : undefined}
          />
          <PrintCard
            number={7}
            title="会則"
            icon={<Book />}
            description="最新の会則"
            onClick={() => handlePrint('constitution')}
          />
        </div>

        <div className="pt-6 border-t">
          <Button variant="outline" onClick={() => router.back()}>戻る</Button>
        </div>
      </Box>

      {/* Print Contents Area */}
      {/* 
         We render ALL components but hide them. 
         Only the one matching `printTarget` gets `print:block`.
      */}

      {/* 1. Cover */}
      <div className={getPrintClass('cover')}>
        <GeneralAssemblyCover
          year={targetFiscalYear}
          organizationName={settings?.name}
          eraName={settings?.wareki_era_name}
          startYear={settings?.wareki_start_year}
        />
      </div>

      {/* 2. Activity Report (Current) */}
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

      {/* 4. Officer List (Next Year) */}
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
  )
}

function PrintCard({ number, title, icon, description, onClick, disabled, warning }: any) {
  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`
        relative flex flex-col p-6 bg-card border rounded-xl shadow-sm transition-all
        ${disabled ? 'opacity-50 cursor-not-allowed bg-muted' : 'cursor-pointer hover:shadow-md hover:border-primary/50'}
      `}
    >
      <div className="absolute top-4 right-4 text-4xl font-bold text-muted-foreground/10 select-none">
        {number}
      </div>
      <div className="flex items-center gap-3 mb-3 text-primary">
        {icon}
        <h3 className="font-bold text-lg">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        {description}
      </p>
      {warning && (
        <p className="text-xs text-destructive mt-2 font-bold">{warning}</p>
      )}
      <div className="mt-4 pt-4 border-t flex justify-end">
        <Button size="sm" variant={disabled ? 'ghost' : 'default'} disabled={disabled} className="gap-2">
          <Printer size={16} /> 印刷
        </Button>
      </div>
    </div>
  )
}
