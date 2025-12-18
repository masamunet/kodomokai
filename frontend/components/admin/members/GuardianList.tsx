'use client';

import { useMemo } from 'react';
import { calculateAge, calculateGrade } from '@/lib/grade-utils';
import Link from 'next/link';

interface GuardianListProps {
  profiles: any[];
  targetFiscalYear: number;
  canEdit?: boolean;
}

export default function GuardianList({ profiles, targetFiscalYear, canEdit }: GuardianListProps) {

  const stats = useMemo(() => {
    // Count 'households' - technically every profile in this list is a guardian/member
    // The user specifically asked: "Display count of guardians who have children registered as members"
    const householdCount = profiles.filter(p => p.children && p.children.length > 0).length;
    return {
      total: profiles.length,
      householdCount
    };
  }, [profiles]);

  return (
    <div>
      {/* Statistics */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-3">統計情報</h3>
        <div className="flex gap-4">
          <div className="bg-orange-50 p-3 rounded-md border border-orange-100 flex-1 md:flex-none md:w-64">
            <span className="block text-sm text-orange-600 font-medium">会員世帯数</span>
            <span className="block text-2xl font-bold text-orange-900">{stats.householdCount}世帯</span>
          </div>
        </div>
      </div>

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
                    {canEdit && <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">操作</span></th>}
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
                                  {child.birthday && ` ${calculateGrade(child.birthday, targetFiscalYear)} (${calculateAge(child.birthday, targetFiscalYear)}歳)`}
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
                      {canEdit && (
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                          <Link
                            href={`/admin/users/${person.id}`}
                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-md text-xs font-medium border border-indigo-100"
                          >
                            編集
                          </Link>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
