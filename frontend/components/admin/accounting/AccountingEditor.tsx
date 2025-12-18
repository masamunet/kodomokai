'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AccountingItem, FiscalReportPayload, upsertFiscalReport } from '@/app/admin/actions/accounting'

interface Props {
  initialData?: any
  currentYear: number
}

export default function AccountingEditor({ initialData, currentYear }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fiscalYear, setFiscalYear] = useState(initialData?.fiscal_year || currentYear)
  const [reportType, setReportType] = useState<'settlement' | 'budget'>(initialData?.report_type || 'settlement')
  const [title, setTitle] = useState(initialData?.title || `${currentYear}年度 会計決算報告書`)
  const [accountant, setAccountant] = useState(initialData?.accountant_name || '')
  const [auditorNames, setAuditorNames] = useState<string>(initialData?.auditor_names?.join('／') || '')
  const [reportDate, setReportDate] = useState(initialData?.report_date || new Date().toISOString().split('T')[0])

  const [incomeItems, setIncomeItems] = useState<AccountingItem[]>(
    initialData?.items?.filter((i: any) => i.category === 'income') || [
      { category: 'income', item_name: '前年度繰越金', budget_amount: 0, actual_amount: 0, description: '', sort_order: 0 }
    ]
  )

  const [expenseItems, setExpenseItems] = useState<AccountingItem[]>(
    initialData?.items?.filter((i: any) => i.category === 'expense') || [
      { category: 'expense', item_name: '', budget_amount: 0, actual_amount: 0, description: '', sort_order: 0 }
    ]
  )

  // Title auto-update if year/type changes and title is default
  useEffect(() => {
    if (!initialData) {
      const typeLabel = reportType === 'settlement' ? '決算報告書' : '予算案'
      setTitle(`${fiscalYear}年度 会計${typeLabel}`)
    }
  }, [fiscalYear, reportType, initialData])

  const addItem = (category: 'income' | 'expense') => {
    const newItem: AccountingItem = {
      category,
      item_name: '',
      budget_amount: 0,
      actual_amount: 0,
      description: '',
      sort_order: (category === 'income' ? incomeItems : expenseItems).length
    }
    if (category === 'income') setIncomeItems([...incomeItems, newItem])
    else setExpenseItems([...expenseItems, newItem])
  }

  const removeItem = (category: 'income' | 'expense', index: number) => {
    if (category === 'income') {
      const newItems = [...incomeItems]
      newItems.splice(index, 1)
      setIncomeItems(newItems)
    } else {
      const newItems = [...expenseItems]
      newItems.splice(index, 1)
      setExpenseItems(newItems)
    }
  }

  const updateItem = (category: 'income' | 'expense', index: number, field: keyof AccountingItem, value: any) => {
    const list = category === 'income' ? [...incomeItems] : [...expenseItems]
    list[index] = { ...list[index], [field]: value }
    if (category === 'income') setIncomeItems(list)
    else setExpenseItems(list)
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(val)
  }

  // Calculations
  const calcSubtotal = (items: AccountingItem[], field: 'budget_amount' | 'actual_amount') => {
    return items.reduce((sum, item) => sum + (Number(item[field]) || 0), 0)
  }

  const incomeBudgetSubtotal = calcSubtotal(incomeItems, 'budget_amount')
  const incomeActualSubtotal = calcSubtotal(incomeItems, 'actual_amount')
  const expenseBudgetSubtotal = calcSubtotal(expenseItems, 'budget_amount')
  const expenseActualSubtotal = calcSubtotal(expenseItems, 'actual_amount')

  const handleSave = async () => {
    setLoading(true)
    const payload: FiscalReportPayload = {
      fiscal_year: Number(fiscalYear),
      report_type: reportType,
      title,
      accountant_name: accountant,
      auditor_names: auditorNames.split('／').filter(n => n.trim() !== ''),
      report_date: reportDate,
      items: [...incomeItems, ...expenseItems].map((item, idx) => ({ ...item, sort_order: idx }))
    }

    const res = await upsertFiscalReport(initialData?.id || null, payload)
    setLoading(false)
    if (res.success) {
      alert(res.message)
      router.push('/admin/accounting')
      router.refresh()
    } else {
      alert(res.message)
    }
  }

  const formatDateJP = (dateStr: string) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
  }

  return (
    <>
      <div className="space-y-8 print:hidden">
        {/* Header Info */}
        <div className="bg-card border border-border p-6 rounded-xl space-y-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground ml-1">対象年度</label>
              <input
                type="number"
                value={fiscalYear}
                onChange={(e) => setFiscalYear(e.target.value)}
                className="w-full bg-background border border-input rounded-md px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground ml-1">種類</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="w-full bg-background border border-input rounded-md px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              >
                <option value="settlement">決算報告</option>
                <option value="budget">予算案</option>
              </select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-muted-foreground ml-1">報告書タイトル</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-background border border-input rounded-md px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Sections */}
        {(['income', 'expense'] as const).map((category) => (
          <section key={category} className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-lg font-bold text-foreground">
                {category === 'income' ? '収入の部' : '支出の部'}
              </h3>
              <button
                onClick={() => addItem(category)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
              >
                ＋ 行を追加
              </button>
            </div>

            <div className="rounded-md border border-border overflow-hidden shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm min-w-[800px]">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="px-4 py-3 font-semibold text-muted-foreground">項目名</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground text-right w-32">予算額</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground text-right w-32">決算額</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground">摘要</th>
                    <th className="px-4 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {(category === 'income' ? incomeItems : expenseItems).map((item, idx) => (
                    <tr key={idx} className="group hover:bg-muted/30 transition-colors">
                      <td className="p-1">
                        <input
                          type="text"
                          value={item.item_name}
                          onChange={(e) => updateItem(category, idx, 'item_name', e.target.value)}
                          className="w-full bg-transparent border-none rounded-md px-3 py-2 text-foreground focus:ring-1 focus:ring-primary transition-all"
                          placeholder="項目名を入力..."
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="number"
                          value={item.budget_amount}
                          onChange={(e) => updateItem(category, idx, 'budget_amount', Number(e.target.value))}
                          className="w-full bg-transparent border-none rounded-md px-3 py-2 text-foreground text-right focus:ring-1 focus:ring-primary transition-all"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="number"
                          value={item.actual_amount}
                          onChange={(e) => updateItem(category, idx, 'actual_amount', Number(e.target.value))}
                          className="w-full bg-transparent border-none rounded-md px-3 py-2 text-foreground text-right focus:ring-1 focus:ring-primary transition-all"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(category, idx, 'description', e.target.value)}
                          className="w-full bg-transparent border-none rounded-md px-3 py-2 text-muted-foreground text-sm focus:ring-1 focus:ring-primary transition-all"
                          placeholder="摘要..."
                        />
                      </td>
                      <td className="p-1">
                        <button
                          onClick={() => removeItem(category, idx)}
                          className="p-2 text-muted-foreground/30 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {/* Subtotal Row */}
                  <tr className="bg-muted/20 font-bold border-t border-border">
                    <td className="px-4 py-3 text-foreground">小計</td>
                    <td className="px-4 py-3 text-right text-foreground">
                      {formatCurrency(category === 'income' ? incomeBudgetSubtotal : expenseBudgetSubtotal)}
                    </td>
                    <td className="px-4 py-3 text-right text-foreground">
                      {formatCurrency(category === 'income' ? incomeActualSubtotal : expenseActualSubtotal)}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        ))}

        {/* Result Section */}
        <section className="bg-card border border-border p-8 rounded-xl space-y-6 shadow-sm">
          <h3 className="text-xl font-bold text-foreground border-b border-border pb-4">収支差引合計（次年度繰越）</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-2">
            <div className="space-y-4">
              <div className="flex justify-between text-muted-foreground text-sm">
                <span>収入合計 (決算額)</span>
                <span className="font-medium text-foreground">{formatCurrency(incomeActualSubtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground text-sm">
                <span>支出合計 (決算額)</span>
                <span className="font-medium text-foreground">- {formatCurrency(expenseActualSubtotal)}</span>
              </div>
              <div className="pt-4 border-t border-border flex justify-between font-bold text-2xl text-primary">
                <span>次年度繰越金</span>
                <span>{formatCurrency(incomeActualSubtotal - expenseActualSubtotal)}</span>
              </div>
            </div>

            <div className="space-y-6 md:border-l md:border-border md:pl-12">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">会計担当者</label>
                <input
                  type="text"
                  value={accountant}
                  onChange={(e) => setAccountant(e.target.value)}
                  placeholder="氏名を入力"
                  className="w-full bg-background border border-input rounded-md px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">会計監査（「／」区切りで複数入力）</label>
                <input
                  type="text"
                  value={auditorNames}
                  onChange={(e) => setAuditorNames(e.target.value)}
                  placeholder="氏名1／氏名2"
                  className="w-full bg-background border border-input rounded-md px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">報告日</label>
                <input
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="w-full bg-background border border-input rounded-md px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-border mt-10">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-11 px-6 gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            印刷 / PDFプレビュー
          </button>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-11 px-8"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-10 shadow-sm"
          >
            {loading ? '保存中...' : '報告書を保存'}
          </button>
        </div>
      </div>

      {/* Print Layout */}
      <div className="hidden print:block font-serif text-black p-4 max-w-[210mm] mx-auto">
        <h1 className="text-xl font-bold text-center mb-2 border-b border-black/50 pb-1">{title}</h1>

        <div className="flex gap-4">
          {/* Income Items */}
          <div className="flex-1 mb-4">
            <h2 className="text-base font-bold border-b border-black mb-1">収入の部</h2>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-black">
                  <th className="text-left py-0.5 w-[35%]">項目</th>
                  <th className="text-right py-0.5 w-[15%]">予算額</th>
                  <th className="text-right py-0.5 w-[15%]">決算額</th>
                  <th className="text-left py-0.5 pl-2">摘要</th>
                </tr>
              </thead>
              <tbody>
                {incomeItems.map((item, idx) => (
                  <tr key={idx} className="border-b border-black/10">
                    <td className="py-0.5">{item.item_name}</td>
                    <td className="text-right py-0.5">{formatCurrency(item.budget_amount)}</td>
                    <td className="text-right py-0.5">{formatCurrency(item.actual_amount)}</td>
                    <td className="py-0.5 pl-2 text-[10px]">{item.description}</td>
                  </tr>
                ))}
                <tr className="border-t border-black font-bold">
                  <td className="py-1">小計</td>
                  <td className="text-right py-1">{formatCurrency(incomeBudgetSubtotal)}</td>
                  <td className="text-right py-1">{formatCurrency(incomeActualSubtotal)}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Expense Items */}
        <div className="mb-4">
          <h2 className="text-base font-bold border-b border-black mb-1">支出の部</h2>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-black">
                <th className="text-left py-0.5 w-[35%]">項目</th>
                <th className="text-right py-0.5 w-[15%]">予算額</th>
                <th className="text-right py-0.5 w-[15%]">決算額</th>
                <th className="text-left py-0.5 pl-2">摘要</th>
              </tr>
            </thead>
            <tbody>
              {expenseItems.map((item, idx) => (
                <tr key={idx} className="border-b border-black/10">
                  <td className="py-0.5">{item.item_name}</td>
                  <td className="text-right py-0.5">{formatCurrency(item.budget_amount)}</td>
                  <td className="text-right py-0.5">{formatCurrency(item.actual_amount)}</td>
                  <td className="py-0.5 pl-2 text-[10px]">{item.description}</td>
                </tr>
              ))}
              <tr className="border-t border-black font-bold">
                <td className="py-1">小計</td>
                <td className="text-right py-1">{formatCurrency(expenseBudgetSubtotal)}</td>
                <td className="text-right py-1">{formatCurrency(expenseActualSubtotal)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="mb-4 break-inside-avoid">
          <h2 className="text-base font-bold border-b border-black mb-1">次年度繰越金</h2>
          <table className="w-full text-xs">
            <tbody>
              <tr>
                <td className="py-0.5 w-[50%]">収入合計</td>
                <td className="text-right py-0.5">{formatCurrency(incomeActualSubtotal)}</td>
              </tr>
              <tr>
                <td className="py-0.5">支出合計</td>
                <td className="text-right py-0.5 border-b border-black">{formatCurrency(expenseActualSubtotal)}</td>
              </tr>
              <tr className="font-bold text-sm">
                <td className="py-1.5">収支差引合計（次年度繰越）</td>
                <td className="text-right py-1.5">{formatCurrency(incomeActualSubtotal - expenseActualSubtotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-8 text-xs break-inside-avoid">
          <div className="mb-2 text-right">{formatDateJP(reportDate)}</div>
          <p className="mb-4">上記の通り会計報告致します。</p>
          <div className="flex justify-end gap-8">
            <div>
              <span className="font-bold mr-2">会計：</span>
              <span>{accountant}</span>
            </div>
            <div>
              <span className="font-bold mr-2">会計監査：</span>
              <span>{auditorNames}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
