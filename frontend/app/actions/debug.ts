'use server'

import { createClient } from '@/lib/supabase/server'

export async function debugOfficerRoles() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('officer_roles').select('*')
  console.log('Officer Roles:', JSON.stringify(data, null, 2))
  if (error) console.error('Error:', error)
  return data
}
