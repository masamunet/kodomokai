
'use client'

import { useState } from 'react'
import { assignOfficer } from '../../actions/officer'
import Link from 'next/link'

type Props = {
  roles: any[]
  profiles: any[]
}

export default function AssignmentForm({ roles, profiles }: Props) {
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setMessage(null)
    const result = await assignOfficer(formData)

    if (result && !result.success) {
      setMessage(result.message)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6 bg-white p-6 shadow sm:rounded-md">
      {message && (
        <div className="bg-red-50 border-red-200 text-red-700 px-4 py-3 rounded border">
          {message}
        </div>
      )}

      <div>
        <label htmlFor="fiscal_year" className="block text-sm font-medium leading-6 text-gray-900">
          対象年度
        </label>
        <div className="mt-2">
          <input
            type="number"
            name="fiscal_year"
            id="fiscal_year"
            defaultValue={2025}
            required
            className="block w-32 rounded-md border-0 py-1.5 p-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div>
        <label htmlFor="role_id" className="block text-sm font-medium leading-6 text-gray-900">
          役職
        </label>
        <div className="mt-2">
          <select
            id="role_id"
            name="role_id"
            required
            className="block w-full rounded-md border-0 py-1.5 p-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          >
            <option value="">選択してください</option>
            {roles?.map(role => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="profile_id" className="block text-sm font-medium leading-6 text-gray-900">
          会員
        </label>
        <div className="mt-2">
          <select
            id="profile_id"
            name="profile_id"
            required
            className="block w-full rounded-md border-0 py-1.5 p-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          >
            <option value="">選択してください</option>
            {profiles?.map(profile => (
              <option key={profile.id} value={profile.id}>{profile.full_name} ({profile.email})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="start_date" className="block text-sm font-medium leading-6 text-gray-900">
            任期開始日
          </label>
          <div className="mt-2">
            <input
              type="date"
              name="start_date"
              id="start_date"
              defaultValue="2025-04-01"
              className="block w-full rounded-md border-0 py-1.5 p-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
        <div>
          <label htmlFor="end_date" className="block text-sm font-medium leading-6 text-gray-900">
            任期終了日
          </label>
          <div className="mt-2">
            <input
              type="date"
              name="end_date"
              id="end_date"
              defaultValue="2026-03-31"
              className="block w-full rounded-md border-0 py-1.5 p-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Link href="/admin/officers" className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
          キャンセル
        </Link>
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          任命する
        </button>
      </div>
    </form>
  )
}
