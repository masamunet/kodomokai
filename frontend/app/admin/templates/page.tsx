import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

import AdminPageHeader from '@/components/admin/AdminPageHeader'

export default async function TemplatesPage() {
  const supabase = await createClient()
  const { data: templates } = await supabase
    .from('notification_templates')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <AdminPageHeader
        title="テンプレート一覧"
        description="お知らせ配信用のテンプレートを管理します。"
        action={{ label: '新規作成', href: '/admin/templates/new' }}
      />

      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {templates?.length === 0 ? (
            <li className="px-4 py-4 sm:px-6 text-gray-500 text-center">テンプレートがありません</li>
          ) : (
            templates?.map((template) => (
              <li key={template.id} className="block hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-medium text-indigo-600">{template.name}</p>
                    <div className="ml-2 flex flex-shrink-0">
                      <p className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                        {new Date(template.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        件名: {template.subject}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}
