import { createClient } from '@/lib/supabase/server'
import { TemplateListScreen } from '@/components/screens/admin/templates/TemplateListScreen'

export default async function TemplatesPage() {
  const supabase = await createClient()
  const { data: templates } = await supabase
    .from('notification_templates')
    .select('*')
    .order('created_at', { ascending: false })

  return <TemplateListScreen templates={templates || []} />
}
