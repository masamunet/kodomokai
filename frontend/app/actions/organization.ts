'use server'

import { createClient } from '@/lib/supabase/server'

export async function getOrganizationSettings() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('organization_settings')
    .select('*')
    .single()

  if (error) {
    console.error('Error fetching organization settings:', error)
    return null
  }

  return data
}
