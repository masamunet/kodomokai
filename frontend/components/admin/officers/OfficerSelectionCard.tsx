'use client'

import { assignNextYearOfficer, deleteNextYearAssignment } from '@/app/admin/actions/officer'
import { useState } from 'react'

type Profile = {
  id: string
  full_name: string
  email: string
  last_name_kana: string
  first_name_kana: string
}

type Role = {
  id: string
  name: string
  description?: string
  display_order: number
}

type Assignment = {
  id: string
  profile_id: string
  role_id: string
  fiscal_year: number
  start_date: string | null
  end_date: string | null
  profile?: Profile
}

type Props = {
  role: Role
  assignments: Assignment[]
  profiles: Profile[]
  nextFiscalYear: number
}

export default function OfficerSelectionCard({ role, assignments, profiles, nextFiscalYear }: Props) {
  const [selectedProfileId, setSelectedProfileId] = useState<string>('')

  // Calculate default dates for the next fiscal year
  const defaultStartDate = `${nextFiscalYear}-04-01`
  const defaultEndDate = `${nextFiscalYear + 1}-03-31`

  // Filter profiles that are already assigned to THIS role to prevent double assignment
  const assignedProfileIds = new Set(assignments.map(a => a.profile_id))
  const availableProfiles = profiles.filter(p => !assignedProfileIds.has(p.id))

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 flex flex-col h-full">
      <div className="px-4 py-5 sm:p-6 flex-1">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-1">
          {role.name}
        </h3>
        <p className="text-sm text-gray-500 mb-4 h-10 line-clamp-2">
          {role.description}
        </p>

        {/* Existing Assignments List */}
        <div className="space-y-3 mb-6">
          {assignments.length > 0 ? (
            <ul className="divide-y divide-gray-200 border-t border-b border-gray-200">
              {assignments.map(assignment => (
                <li key={assignment.id} className="py-3 flex justify-between items-center group">
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {assignment.profile?.full_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {assignment.profile?.last_name_kana} {assignment.profile?.first_name_kana}
                    </p>
                  </div>
                  <form action={async (formData) => { await deleteNextYearAssignment(formData) }}>
                    <input type="hidden" name="id" value={assignment.id} />
                    <button
                      type="submit"
                      className="text-xs text-red-600 hover:text-red-800 border-red-100 border px-2 py-1 rounded bg-red-50"
                    >
                      解除
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400 py-2 italic text-center bg-gray-50 rounded">
              選出された役員はいません
            </p>
          )}
        </div>

        {/* Add New Assignment Form */}
        <div className="pt-2 border-t border-gray-100">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            役員を追加
          </h4>
          <form action={async (formData) => {
            await assignNextYearOfficer(formData)
            setSelectedProfileId('') // Reset selection after submit (optimistic)
          }}>
            <input type="hidden" name="role_id" value={role.id} />
            <input type="hidden" name="fiscal_year" value={nextFiscalYear} />
            <input type="hidden" name="start_date" value={defaultStartDate} />
            <input type="hidden" name="end_date" value={defaultEndDate} />

            <div className="space-y-2">
              <select
                name="profile_id"
                required
                className="block w-full rounded-md border-gray-300 py-1.5 pl-3 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-xs border"
                value={selectedProfileId}
                onChange={(e) => setSelectedProfileId(e.target.value)}
              >
                <option value="">会員を選択</option>
                {availableProfiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.full_name} ({profile.email})
                  </option>
                ))}
              </select>

              <button
                type="submit"
                disabled={!selectedProfileId}
                className="w-full inline-flex justify-center items-center rounded-md bg-white border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                追加する
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
