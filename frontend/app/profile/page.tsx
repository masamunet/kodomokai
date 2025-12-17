import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ProfileForm from './ProfileForm'
import DeleteChildButton from './DeleteChildButton'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>ログインしてください</div>
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: children } = await supabase
    .from('children')
    .select('*')
    .eq('parent_id', user.id)
    .order('birthday', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">マイページ</h1>
          <Link href="/" className="text-indigo-600 hover:text-indigo-500">
            ← ダッシュボードへ戻る
          </Link>
        </div>

        {/* Profile Section */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">保護者情報</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">連絡先等の情報を更新できます。</p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <ProfileForm profile={profile} />
          </div>
        </div>

        {/* Children Section */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">お子様情報</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">登録されているお子様の一覧です。</p>
            </div>
            <Link
              href="/profile/children/new"
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              お子様を追加
            </Link>
          </div>
          <div className="border-t border-gray-200">
            <ul role="list" className="divide-y divide-gray-200">
              {children?.length === 0 ? (
                <li className="px-4 py-4 sm:px-6 text-gray-500 text-center">登録がありません</li>
              ) : (
                children?.map((child) => (
                  <li key={child.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-indigo-600">{child.full_name}</p>
                        <p className="text-sm text-gray-500">
                          {child.gender === 'male' ? '男の子' : child.gender === 'female' ? '女の子' : 'その他'}
                          {' / '}
                          {child.birthday ? new Date(child.birthday).toLocaleDateString() : '誕生日未登録'}
                        </p>
                        {child.allergies && (
                          <p className="text-xs text-red-500 mt-1">アレルギー: {child.allergies}</p>
                        )}
                      </div>
                      <DeleteChildButton childId={child.id} />
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
