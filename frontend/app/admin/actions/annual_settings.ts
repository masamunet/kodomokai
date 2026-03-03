'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireOfficer } from '@/lib/security'

export async function getAnnualSettings(fiscalYear: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('annual_settings')
    .select('*')
    .eq('fiscal_year', fiscalYear)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching annual settings:', error)
  }

  return data
}

export async function updateAnnualSettings(fiscalYear: number, invitationCode: string) {
  await requireOfficer()
  const supabase = await createClient()

  const { error } = await supabase
    .from('annual_settings')
    .upsert({
      fiscal_year: fiscalYear,
      invitation_code: invitationCode,
      updated_at: new Date().toISOString(),
    })

  if (error) {
    console.error('Update annual settings error:', error)
    return { success: false, message: '設定の更新に失敗しました: ' + error.message }
  }

  revalidatePath('/admin/settings')
  return { success: true, message: '招待コードを更新しました' }
}
