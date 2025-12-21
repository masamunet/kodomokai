'use client'

import { Input } from '@/ui/primitives/Input'
import { useState } from 'react'
import { adminUpdateProfile, adminDeleteProfile } from '@/app/admin/actions/user'
import { useRouter } from 'next/navigation'

type Props = {
  profile: any
}

export default function AdminUserForm({ profile }: Props) {
  const [message, setMessage] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (formData: FormData) => {
    setMessage(null)
    const result = await adminUpdateProfile(formData)

    if (result) {
      setMessage(result.message)
      if (result.success) {
        setTimeout(() => setMessage(null), 3000)
      }
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <input type="hidden" name="id" value={profile.id} />

      {message && (
        <div className={`border px-4 py-3 rounded ${message.includes('失敗') || message.includes('エラー') ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <label className="block text-sm font-medium text-gray-700">お名前 <span className="text-red-500">*</span></label>
          <div className="mt-1 flex gap-2">
            <div className="w-1/2">
              <Input type="text" name="last_name" placeholder="苗字" defaultValue={profile?.last_name || ''} required />
            </div>
            <div className="w-1/2">
              <Input type="text" name="first_name" placeholder="名前" defaultValue={profile?.first_name || ''} required />
            </div>
          </div>
        </div>

        <div className="sm:col-span-3">
          <label className="block text-sm font-medium text-gray-700">ふりがな</label>
          <div className="mt-1 flex gap-2">
            <div className="w-1/2">
              <Input type="text" name="last_name_kana" placeholder="みょうじ" defaultValue={profile?.last_name_kana || ''} />
            </div>
            <div className="w-1/2">
              <Input type="text" name="first_name_kana" placeholder="なまえ" defaultValue={profile?.first_name_kana || ''} />
            </div>
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">メールアドレス</label>
          <div className="mt-1">
            <Input type="email" name="email" id="email" defaultValue={profile?.email || ''} readOnly className="bg-gray-50" />
            <p className="text-xs text-gray-500 mt-1">メールアドレスの変更はできません。</p>
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">電話番号</label>
          <div className="mt-1">
            <Input type="tel" name="phone" id="phone" defaultValue={profile?.phone || ''} />
          </div>
        </div>

        <div className="sm:col-span-6">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">住所</label>
          <div className="mt-1">
            <Input type="text" name="address" id="address" defaultValue={profile?.address || ''} />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-border mt-8">
        <div>
          <button
            type="button"
            disabled={isDeleting}
            onClick={async () => {
              if (!confirm('この会員を本当に削除しますか？\n（同時にお子様の情報もすべて論理削除されます。現年度以降の役員として登録されている場合は削除できません）')) return

              setIsDeleting(true)
              setMessage(null)

              const formData = new FormData()
              formData.append('id', profile.id)

              const result = await adminDeleteProfile(formData)
              if (result && !result.success) {
                setMessage(result.message)
                setIsDeleting(false)
              }
            }}
            className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-50 disabled:opacity-50"
          >
            {isDeleting ? '削除中...' : '会員を削除'}
          </button>
        </div>
        <div className="flex gap-3">
          <button type="submit" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            保護者情報を更新
          </button>
        </div>
      </div>
    </form>
  )
}
