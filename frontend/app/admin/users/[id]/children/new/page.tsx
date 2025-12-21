import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ChildAddScreen } from '@/components/screens/admin/users/ChildAddScreen'

export default async function AdminAddChildPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('id', id)
    .single()

  if (!profile) {
    notFound()
  }

  return <ChildAddScreen parentId={id} profile={profile} />
}
