import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AdminFormLayout from '@/components/admin/AdminFormLayout'
import AdminChildForm from '@/components/admin/users/AdminChildForm'

export default async function AdminAddChildPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params // id is parentId here
  const supabase = await createClient()

  // Verify parent exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('id', id)
    .single()

  if (!profile) {
    notFound()
  }

  return (
    <AdminFormLayout
      title="お子様の追加"
      backLink={{ href: `/admin/users/${id}`, label: '会員編集に戻る' }}
    >
      <div className="bg-white shadow sm:rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <p className="text-sm text-gray-500">
            保護者: <span className="font-medium text-gray-900">{profile.full_name}</span>
          </p>
        </div>
        <AdminChildForm parentId={id} />
      </div>
    </AdminFormLayout>
  )
}
