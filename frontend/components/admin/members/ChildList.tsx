'use client';

import { useMemo } from 'react';
import { calculateGrade, calculateAge, getGradeOrder, GRADES } from '@/lib/grade-utils';
import CopyToClipboard from '@/components/ui/CopyToClipboard';
import Link from 'next/link';

interface ChildListProps {
  profiles: any[]; // Ideally typed properly
  targetFiscalYear: number;
}

export default function ChildList({ profiles, targetFiscalYear }: ChildListProps) {
  // Flatten children data
  const allChildren = useMemo(() => {
    const list: any[] = [];
    profiles.forEach((profile) => {
      if (profile.children && Array.isArray(profile.children)) {
        profile.children.forEach((child: any) => {
          const grade = calculateGrade(child.birthday, targetFiscalYear);
          const age = calculateAge(child.birthday, targetFiscalYear);
          list.push({
            ...child,
            grade,
            age,
            parent_name: profile.full_name,
            parent_id: profile.id,
          });
        });
      }
    });

    // Default sort by grade
    return list.sort((a, b) => {
      const gA = getGradeOrder(a.grade);
      const gB = getGradeOrder(b.grade);
      if (gA !== gB) return gA - gB;
      // If same grade, sort by kana
      const kanaA = `${a.last_name_kana} ${a.first_name_kana}`;
      const kanaB = `${b.last_name_kana} ${b.first_name_kana}`;
      return kanaA.localeCompare(kanaB, 'ja');
    });
  }, [profiles, targetFiscalYear]);

  // Statistics
  const stats = useMemo(() => {
    const total = allChildren.length;
    let elementaryCount = 0;
    const gradeCounts: Record<string, number> = {};

    allChildren.forEach(child => {
      const g = child.grade;
      gradeCounts[g] = (gradeCounts[g] || 0) + 1;
      if (g.startsWith('小学')) {
        elementaryCount++;
      }
    });

    return { total, elementaryCount, gradeCounts };
  }, [allChildren]);

  if (allChildren.length === 0) {
    return <div className="p-4 text-center text-gray-500">登録されているお子様はいません。</div>;
  }

  return (
    <div>
      {/* Statistics Section */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-3">統計情報</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
            <span className="block text-sm text-blue-600 font-medium">子供総数</span>
            <span className="block text-2xl font-bold text-blue-900">{stats.total}名</span>
          </div>
          <div className="bg-green-50 p-3 rounded-md border border-green-100">
            <span className="block text-sm text-green-600 font-medium">小学生総数</span>
            <span className="block text-2xl font-bold text-green-900">{stats.elementaryCount}名</span>
          </div>
        </div>
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">学年別内訳</h4>
          <div className="flex flex-wrap gap-2">
            {Object.keys(stats.gradeCounts)
              .sort((a, b) => getGradeOrder(a) - getGradeOrder(b))
              .map(grade => (
                <span key={grade} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                  {grade}: {stats.gradeCounts[grade]}名
                </span>
              ))}
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 whitespace-nowrap">学年</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">氏名</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">年齢</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">生年月日</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">苗字</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">名前</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">かな(姓)</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">かな(名)</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">アレルギー</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">特記事項</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">保護者</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {allChildren.map((child) => (
              <tr key={child.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {child.grade}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 group">
                  <div className="flex items-center gap-1">
                    {child.full_name}
                    <CopyToClipboard text={child.full_name} />
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {child.age}歳
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {child.birthday ? new Date(child.birthday).toLocaleDateString('ja-JP') : '-'}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    {child.last_name}
                    <CopyToClipboard text={child.last_name} />
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    {child.first_name}
                    <CopyToClipboard text={child.first_name} />
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    {child.last_name_kana}
                    <CopyToClipboard text={child.last_name_kana} />
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    {child.first_name_kana}
                    <CopyToClipboard text={child.first_name_kana} />
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-red-600 font-medium">
                  {child.allergy}
                </td>
                <td className=" px-3 py-4 text-sm text-gray-500 min-w-[150px]">
                  {child.notes}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-indigo-600 hover:text-indigo-900">
                  <Link href={`/admin/users/${child.parent_id}`}>
                    {child.parent_name}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
