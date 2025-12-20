
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireOfficer } from '@/lib/security'

export async function updateSettings(formData: FormData) {
  await requireOfficer()
  const supabase = await createClient()

  // We assume there's only one row, or we grab the first one.
  // Ideally we pass an ID, but for singleton settings, we can just update the first row found or upsert.

  const name = formData.get('name') as string
  const fiscal_year_start_month = parseInt(formData.get('fiscal_year_start_month') as string)
  const wareki_era_name = formData.get('wareki_era_name') as string
  const wareki_start_year = parseInt(formData.get('wareki_start_year') as string)
  const admission_fee = parseInt(formData.get('admission_fee') as string)
  const annual_fee = parseInt(formData.get('annual_fee') as string)

  // Check if a row exists
  const { data: existing } = await supabase.from('organization_settings').select('id').single()

  let error;
  if (existing) {
    const { error: updateError } = await supabase
      .from('organization_settings')
      .update({ name, fiscal_year_start_month, wareki_era_name, wareki_start_year, admission_fee, annual_fee })
      .eq('id', existing.id)
    error = updateError
  } else {
    const { error: insertError } = await supabase
      .from('organization_settings')
      .insert({ name, fiscal_year_start_month, wareki_era_name, wareki_start_year, admission_fee, annual_fee })
    error = insertError
  }

  if (error) {
    console.error('Update settings error:', error)
    return { success: false, message: '設定の更新に失敗しました: ' + error.message }
  }

  revalidatePath('/admin/settings')
  return { success: true, message: '設定を更新しました' }
}

export async function getTargetFiscalYear() {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const targetFiscalYear = cookieStore.get('target_fiscal_year')

  if (targetFiscalYear) {
    return parseInt(targetFiscalYear.value)
  }

  // Default to current fiscal year (April start)
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1 // 0-11 -> 1-12

  // Assuming 4 (April) is the start. 
  return currentMonth < 4 ? currentYear - 1 : currentYear
}

export async function getOrganizationSettings() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('organization_settings').select('*').single()

  if (error) {
    console.error('Error fetching organization settings:', error)
    return null
  }
  return data
}
