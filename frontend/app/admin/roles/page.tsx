import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

export default async function AdminRolesPage() {
  const supabase = await createClient()
  const { data: roles } = await supabase
    .from('officer_roles')
    .select('*')
    .order('display_order', { ascending: true })
    .order('name')

  return (
    <div>
      <AdminPageHeader
        title="役職管理"
        description="役員の役職を管理します。"
        action={{ label: '役職を追加', href: '/admin/roles/new' }}
      />
      <div className="mt-8 flow-root">
        <div className="overflow-hidden bg-white shadow sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200">
            {roles?.length === 0 ? (
              <li className="px-4 py-4 sm:px-6 text-gray-500 text-center">登録された役職はありません</li>
            ) : (
              roles?.map((role) => (
                <li key={role.id}>
                  <Link href={`/admin/roles/${role.id}`} className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium text-indigo-600">{role.name}</p>
                          <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                            表示順: {role.display_order}
                          </span>
                        </div>
                        {role.description && (
                          <p className="mt-1 text-sm text-gray-500">{role.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-500">
                          {new Date(role.created_at).toLocaleDateString('ja-JP')}
                        </div>
                        <span className="text-gray-400">&rarr;</span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
