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

  return (
    <div className="space-y-8">
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
  )
}
