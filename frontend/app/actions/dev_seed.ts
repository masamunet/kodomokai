
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function seedOfficerData(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  // 1. Create Roles if not exist
  const roles = [
    { name: '会長', description: '子供会の代表者' },
    { name: '会計', description: '金銭管理' },
    { name: '書記', description: '議事録作成・記録' }
  ]

  for (const r of roles) {
    const { data: existing } = await supabase.from('officer_roles').select('id').eq('name', r.name).single()
    if (!existing) {
      await supabase.from('officer_roles').insert(r)
    }
  }

  // 2. Assign '会長' to current user
  const { data: chairRole } = await supabase.from('officer_roles').select('id').eq('name', '会長').single()
  if (chairRole) {
    const { data: existingAssignment } = await supabase
      .from('officer_role_assignments')
      .select('id')
      .eq('profile_id', user.id)
      .eq('role_id', chairRole.id)
      .eq('fiscal_year', 2025)
      .single()

    if (!existingAssignment) {
      await supabase.from('officer_role_assignments').insert({
        profile_id: user.id,
        role_id: chairRole.id,
        fiscal_year: 2025,
        start_date: '2025-04-01',
        end_date: '2026-03-31'
      })
    }

    // 3. Create Tasks for Chair
    const tasks = [
      { title: '総会資料作成', description: '4月の総会に向けた資料を作成する', is_monthly: false, due_date: '2025-03-31' },
      { title: '定例会開催', description: '毎月の定例会を主催する', is_monthly: true }
    ]

    for (const t of tasks) {
      // Simple check to avoid dups
      const { data: existTask } = await supabase.from('officer_tasks').select('id').eq('title', t.title).eq('role_id', chairRole.id).single()
      if (!existTask) {
        await supabase.from('officer_tasks').insert({
          role_id: chairRole.id,
          ...t
        })
      }
    }
  }

  // Update user to be admin for convenience
  await supabase.from('profiles').update({ is_admin: true }).eq('id', user.id)

  revalidatePath('/')
}
