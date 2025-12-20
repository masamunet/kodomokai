'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireOfficer } from '@/lib/security'

export type AccountingItem = {
  id?: string
  category: 'income' | 'expense'
  item_name: string
  budget_amount: number
  actual_amount: number
  description: string
  sort_order: number
}

export type FiscalReportPayload = {
  fiscal_year: number
  report_type: 'settlement' | 'budget'
  title: string
  accountant_name: string
  auditor_names: string[]
  report_date: string
  items: AccountingItem[]
}

export async function getFiscalReports(year?: number) {
  await requireOfficer()
  const supabase = await createClient()
  let query = supabase.from('fiscal_reports').select('*').order('fiscal_year', { ascending: false })

  if (year) {
    query = query.eq('fiscal_year', year)
  }

  const { data, error } = await query
  if (error) {
    console.error('Error fetching fiscal reports:', error)
    return []
  }
  return data
}

export async function getFiscalReportWithItems(id: string) {
  await requireOfficer()
  const supabase = await createClient()

  const { data: report, error: reportError } = await supabase
    .from('fiscal_reports')
    .select('*')
    .eq('id', id)
    .single()

  if (reportError) {
    console.error('Error fetching report:', reportError)
    return null
  }

  const { data: items, error: itemsError } = await supabase
    .from('accounting_items')
    .select('*')
    .eq('report_id', id)
    .order('sort_order', { ascending: true })

  if (itemsError) {
    console.error('Error fetching items:', itemsError)
    return { ...report, items: [] }
  }

  return { ...report, items }
}

export async function upsertFiscalReport(id: string | null, payload: FiscalReportPayload) {
  await requireOfficer()
  const supabase = await createClient()
  const { items, ...reportData } = payload

  let reportId = id

  if (id) {
    // Update report body
    const { error: updateError } = await supabase
      .from('fiscal_reports')
      .update(reportData)
      .eq('id', id)

    if (updateError) {
      return { success: false, message: '基本情報の更新に失敗しました: ' + updateError.message }
    }
  } else {
    // Insert report body
    const { data: newReport, error: insertError } = await supabase
      .from('fiscal_reports')
      .insert(reportData)
      .select()
      .single()

    if (insertError) {
      return { success: false, message: '基本情報の作成に失敗しました: ' + insertError.message }
    }
    reportId = newReport.id
  }

  if (!reportId) return { success: false, message: 'IDの取得に失敗しました' }

  // Handle Items (Delete and Re-insert for simplicity in this case)
  // In a more complex production app, we'd do a proper diff/upsert
  const { error: deleteError } = await supabase
    .from('accounting_items')
    .delete()
    .eq('report_id', reportId)

  if (deleteError) {
    return { success: false, message: '項目の更新準備に失敗しました: ' + deleteError.message }
  }

  const itemsWithReportId = items.map(item => ({
    ...item,
    report_id: reportId
  }))

  const { error: itemsError } = await supabase
    .from('accounting_items')
    .insert(itemsWithReportId)

  if (itemsError) {
    return { success: false, message: '項目の保存に失敗しました: ' + itemsError.message }
  }

  revalidatePath('/admin/accounting')
  return { success: true, message: '会計報告を保存しました', id: reportId }
}

export async function deleteFiscalReport(id: string) {
  await requireOfficer()
  const supabase = await createClient()
  const { error } = await supabase.from('fiscal_reports').delete().eq('id', id)

  if (error) {
    return { success: false, message: '削除に失敗しました: ' + error.message }
  }

  revalidatePath('/admin/accounting')
  return { success: true, message: '会計報告を削除しました' }
}
