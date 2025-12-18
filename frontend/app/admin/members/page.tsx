import { createClient } from '@/lib/supabase/server'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import MemberTabs from '@/components/admin/members/MemberTabs'
import ChildList from '@/components/admin/members/ChildList'
import GuardianList from '@/components/admin/members/GuardianList'
import OfficerList from '@/components/admin/members/OfficerList'
import { getTargetFiscalYear } from '../actions/settings'
import { toWarekiYear } from '@/lib/date-utils'

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
      .order('role(display_order)', { ascending: true })
      .order('created_at', { ascending: false })
    assignments = data || []
  }

  return (
    <div>
      <AdminPageHeader
        title="会員名簿"
        description="会員（保護者）、お子様、および役員の名簿を管理します。"
      />

      <div className="mt-8">
        <MemberTabs />

        {view === 'child' && (
          <ChildList profiles={profiles} targetFiscalYear={currentFiscalYear} canEdit={canEdit} />
        )}

        {view === 'guardian' && (
          <GuardianList profiles={profiles} targetFiscalYear={currentFiscalYear} canEdit={canEdit} />
        )}

        {view === 'officer' && (
          <OfficerList assignments={assignments} titleYear={titleYear} />
        )}
      </div>
    </div>
  )
}

