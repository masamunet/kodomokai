'use client';

import { useMemo } from 'react';

interface OfficerListProps {
  assignments: any[];
  titleYear: string;
}

export default function OfficerList({ assignments, titleYear }: OfficerListProps) {

  const officerCount = useMemo(() => {
    return new Set((assignments || []).map((a: any) => a.profile_id)).size;
  }, [assignments]);

  return (
    <div>
      {/* Stats */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-2">概要</h3>
        <p className="text-gray-700">対象年度: <span className="font-bold">{titleYear}度</span></p>
        <p className="text-gray-700">役員総数: <span className="font-bold text-xl">{officerCount}名</span></p>
      </div>

      <div className="flow-root mt-6">
        <div className="overflow-hidden bg-white shadow sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200 border-t border-gray-200">
            {(assignments || []).length === 0 ? (
              <li className="px-4 py-4 sm:px-6 text-gray-500 text-center">任命された役員はいません</li>
            ) : (
              (assignments || []).map((assignment: any) => (
                <li key={assignment.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    {/* Role & Year - Fixed width on desktop for alignment */}
                    <div className="flex items-center gap-2 sm:w-48 shrink-0">
                      <span className="font-bold text-gray-900 text-lg">{assignment.role?.name}</span>
                    </div>

                    {/* Name & Meta Info - Flex grow */}
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6 min-w-0">
                      <div className="flex flex-col">
                        <div className="flex items-baseline gap-2 shrink-0">
                          <p className="text-sm font-medium text-indigo-600">{assignment.profile.full_name}</p>
                          <p className="text-xs text-gray-400 whitespace-nowrap">({assignment.profile.last_name_kana} {assignment.profile.first_name_kana})</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 min-w-0">
                        <span className="truncate">{assignment.profile.email}</span>
                        <span className="whitespace-nowrap text-gray-400">任期: {assignment.start_date} 〜 {assignment.end_date}</span>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
