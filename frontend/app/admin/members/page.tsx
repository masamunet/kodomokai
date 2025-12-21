import { createClient } from '@/lib/supabase/server'
import { getTargetFiscalYear } from '../actions/settings'
import { toWarekiYear } from '@/lib/date-utils'
import { MemberScreen } from '@/components/screens/admin/members/MemberScreen'

export const dynamic = 'force-dynamic'

type ViewType = 'child' | 'guardian' | 'officer'

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const view = (params.view as ViewType) || 'child'
  const currentFiscalYear = await getTargetFiscalYear()

  // Common data needed for some views
  let profiles: any[] = []
  let assignments: any[] = []
  let titleYear = ''

  // Fetch settings for Wareki conversion if needed
  const { data: settings } = await supabase.from('organization_settings').select('*').single()
  const warekiEraName = settings?.wareki_era_name || '令和'
  const warekiStartYear = settings?.wareki_start_year || 2019
  titleYear = toWarekiYear(currentFiscalYear, warekiEraName, warekiStartYear)

  // Permissions check
  const { data: { user } } = await supabase.auth.getUser()
  let canEdit = false

  if (user) {
    // Check if the current user has any officer role with edit permissions for this fiscal year
    const { data: myRoles } = await supabase
      .from('officer_role_assignments')
      .select(`
        role:officer_roles(can_edit_members)
      `)
      .eq('profile_id', user.id)
      .eq('fiscal_year', currentFiscalYear)

    // Check if any role has edit permission
    if (myRoles && myRoles.length > 0) {
      // @ts-ignore - Supabase types might verify this structure but let's be safe with check
      canEdit = myRoles.some((assignment: any) => assignment.role?.can_edit_members === true)
    }

    // Fallback: Check if user is an admin in profiles (legacy support or super admin)
    const { data: myProfile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (myProfile?.is_admin) {
      canEdit = true
    }
  }

  if (view === 'child' || view === 'guardian') {
    const { data } = await supabase
      .from('profiles')
      .select(`
          *,
          children (*)
      `)
      .order('joined_at', { ascending: false })
    profiles = data || []
  }

  if (view === 'officer') {
    const { data } = await supabase
      .from('officer_role_assignments')
      .select(`
          *,
          role:officer_roles(*),
          profile:profiles(full_name, email, last_name_kana, first_name_kana, address, phone)
      `)
      .eq('fiscal_year', currentFiscalYear)

    if (data) {
      assignments = data.sort((a, b) => {
        // Sort by role display_order (ascending)
        const orderA = a.role?.display_order ?? 999
        const orderB = b.role?.display_order ?? 999
        if (orderA !== orderB) return orderA - orderB

        // Then by created_at (descending)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
    } else {
      assignments = []
    }
  }

  return (
    <MemberScreen
      view={view}
      profiles={profiles}
      assignments={assignments}
      titleYear={titleYear}
      targetFiscalYear={currentFiscalYear}
      canEdit={canEdit}
    />
  )
}

