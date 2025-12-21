import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ChildEditScreen } from '@/components/screens/admin/users/ChildEditScreen'

type Params = Promise<{ id: string; childId: string }>

export default async function AdminEditChildPage({ params }: { params: Params }) {
  const { id, childId } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('id', id)
    .single()

  if (!profile) {
    notFound()
  }

  const { data: child } = await supabase
    .from('children')
    .select('*')
    .eq('id', childId)
    .single()

  if (!child) {
    notFound()
  }

  return (
    <ChildEditScreen
      parentId={id}
      profile={profile}
      child={child}
    />
  )
}
