import ChildForm from './ChildForm'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function NewChildPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('last_name, last_name_kana')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="mx-auto max-w-2xl bg-white shadow sm:rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6">お子様の追加</h2>
        <ChildForm
          initialLastName={profile?.last_name || ''}
          initialLastNameKana={profile?.last_name_kana || ''}
        />
      </div >
    </div >
  )
}
