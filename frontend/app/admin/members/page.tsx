import { createClient } from '@/lib/supabase/server'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

export default async function AdminMembersPage() {
  const supabase = await createClient()

  // Helper to fetch profiles with children
  const { data: profiles } = await supabase
    .from('profiles')
    .select(`
        *,
        children (*)
    `)
    .order('created_at', { ascending: false })

  return (
    <div>
      <AdminPageHeader
        title="会員一覧"
        description="登録されている全会員（保護者）とそのお子様の一覧です。"
      />
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-muted/50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-foreground sm:pl-6">
                      名前 (保護者)
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">
                      メールアドレス
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">
                      連絡先
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">
                      お子様
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">
                      登録日
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-background">
                  {profiles?.map((person) => (
                    <tr key={person.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-foreground sm:pl-6">
                        <div>
                          {person.full_name || '未設定'}
                          {person.is_admin && <span className="ml-2 inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">管理者</span>}
                        </div>
                        <div className="text-xs text-gray-400">
                          {person.last_name_kana} {person.first_name_kana}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">{person.email}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">{person.phone || '-'}</td>
                      <td className="px-3 py-4 text-sm text-muted-foreground">
                        {person.children && person.children.length > 0 ? (
                          <ul className="list-disc list-inside">
                            {person.children.map((child: any) => (
                              <li key={child.id}>
                                {child.full_name}
                                <span className="text-xs text-gray-400 ml-1">({child.last_name_kana} {child.first_name_kana})</span>
                                <span className="ml-1 text-gray-500">
                                  - {child.gender === 'male' ? '男' : child.gender === 'female' ? '女' : '他'}
                                  {child.birthday && ` ${new Date().getFullYear() - new Date(child.birthday).getFullYear()}歳`}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-gray-400">登録なし</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(person.joined_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
