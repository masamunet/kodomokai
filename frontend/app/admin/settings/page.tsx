import { createClient } from '@/lib/supabase/server'
import SettingsForm from './SettingsForm'

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  // Fetch settings. If not exists, use defaults.
  const { data: settings } = await supabase.from('organization_settings').select('*').single()

  // Defaults if null (e.g. before initial seed/migration takes effect or if empty)
  const name = settings?.name || '子供会'
  const startMonth = settings?.fiscal_year_start_month || 4

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-6">会の設定</h2>
      <SettingsForm initialName={name} initialStartMonth={startMonth} />
    </div>
  )
}
