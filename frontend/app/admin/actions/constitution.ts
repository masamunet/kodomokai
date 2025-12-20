'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireOfficer } from '@/lib/security'

export async function getConstitution() {
  await requireOfficer()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('constitutions')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching constitution:', error.message)
    return null
  }

  return data
}

export async function upsertConstitution(formData: FormData) {
  await requireOfficer()
  const supabase = await createClient()

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const version_date = formData.get('version_date') as string
  const version_name = formData.get('version_name') as string

  // Get current one to update
  const { data: existing } = await supabase
    .from('constitutions')
    .select('id')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  const payload = {
    title,
    content,
    version_date,
    version_name: version_name || null,
    updated_at: new Date().toISOString()
  }

  let error
  if (existing) {
    const { error: updError } = await supabase
      .from('constitutions')
      .update(payload)
      .eq('id', existing.id)
    error = updError
  } else {
    const { error: insError } = await supabase
      .from('constitutions')
      .insert(payload)
    error = insError
  }

  if (error) {
    console.error('Upsert constitution error:', error)
    return { success: false, message: '規約の保存に失敗しました: ' + error.message }
  }

  revalidatePath('/admin/constitution')
  return { success: true, message: '規約を保存しました' }
}
