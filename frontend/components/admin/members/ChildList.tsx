'use client';

import { useMemo, useState } from 'react';
import { calculateGrade, calculateAge, getGradeOrder } from '@/lib/grade-utils';
import CopyToClipboard from '@/components/ui/CopyToClipboard';
import Link from 'next/link';
import { Baby, ArrowUpDown, ChevronUp, ChevronDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ChildListProps {
  profiles: any[]; // Ideally typed properly
  targetFiscalYear: number;
  canEdit?: boolean;
}

export default function ChildList({ profiles, targetFiscalYear, canEdit }: ChildListProps) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({
    key: 'grade',
    direction: 'asc',
  });
  const [searchQuery, setSearchQuery] = useState('');

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

    // 検索フィルタ
    const filteredList = list.filter(child => {
      const s = searchQuery.toLowerCase();
      if (!s) return true;
      return (
        child.full_name?.toLowerCase().includes(s) ||
        child.last_name_kana?.includes(s) ||
        child.first_name_kana?.includes(s) ||
        child.grade?.toLowerCase().includes(s) ||
        child.parent_name?.toLowerCase().includes(s) ||
        child.notes?.toLowerCase().includes(s) ||
        child.allergies?.toLowerCase().includes(s)
      );
    });

    if (sortConfig !== null) {
      filteredList.sort((a, b) => {
        let valA: any = a[sortConfig.key];
        let valB: any = b[sortConfig.key];

        // Custom logic for specific keys
        if (sortConfig.key === 'grade') {
          valA = getGradeOrder(a.grade);
          valB = getGradeOrder(b.grade);
        } else if (sortConfig.key === 'full_name') {
          valA = `${a.last_name_kana} ${a.first_name_kana}`;
          valB = `${b.last_name_kana} ${b.first_name_kana}`;
        } else if (sortConfig.key === 'kana') {
          valA = `${a.last_name_kana} ${a.first_name_kana}`;
          valB = `${b.last_name_kana} ${b.first_name_kana}`;
        }

        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;

        if (valA < valB) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredList;
  }, [profiles, targetFiscalYear, sortConfig, searchQuery]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="h-3 w-3 ml-1 text-muted-foreground/30" />;
    }
    return sortConfig.direction === 'asc'
      ? <ChevronUp className="h-3 w-3 ml-1 text-primary" />
      : <ChevronDown className="h-3 w-3 ml-1 text-primary" />;
  };

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

  if (profiles.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">登録されているお子様はいません。</div>;
  }

  return (
    <div>
      {/* Statistics Section */}
      <div className="bg-background p-4 rounded-lg shadow-sm mb-6 border border-border">
        <h3 className="text-lg font-bold text-foreground mb-3">統計情報</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-primary/10 p-3 rounded-md border border-primary/20">
            <span className="block text-sm text-primary font-medium">子供総数</span>
            <span className="block text-2xl font-bold text-foreground">{stats.total}名</span>
          </div>
          <div className="bg-muted p-3 rounded-md border border-border">
            <span className="block text-sm text-foreground font-medium">小学生総数</span>
            <span className="block text-2xl font-bold text-foreground">{stats.elementaryCount}名</span>
          </div>
        </div>
        <div className="mt-6">
          <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Baby className="h-4 w-4 text-primary" />
            学年別内訳
          </h4>
          <div className="max-w-md bg-background rounded-md border border-border overflow-hidden">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-muted text-foreground border-b border-border">
                  <th className="text-left py-2 px-4 font-bold">学年</th>
                  <th className="text-right py-2 px-4 font-bold">人数</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {Object.keys(stats.gradeCounts)
                  .sort((a, b) => getGradeOrder(a) - getGradeOrder(b))
                  .map((grade, index) => (
                    <tr key={grade} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                      <td className="py-2 px-4 text-foreground">{grade}</td>
                      <td className="py-2 px-4 text-right font-medium text-primary">{stats.gradeCounts[grade]}名</td>
                    </tr>
                  ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted/50 font-bold border-t border-border">
                  <td className="py-2 px-4 text-foreground">合計</td>
                  <td className="py-2 px-4 text-right text-foreground">{stats.total}名</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3 items-end justify-between">
        <div className="w-full sm:max-w-xs relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            type="text"
            placeholder="氏名、かな、学年などで検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-xs text-muted-foreground italic">
          {allChildren.length}名を表示中
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto shadow-sm ring-1 ring-border rounded-lg bg-background">
        {allChildren.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            検索条件に一致するお子様は見つかりませんでした。
          </div>
        ) : (
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th scope="col" onClick={() => requestSort('grade')} className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-foreground sm:pl-6 whitespace-nowrap cursor-pointer hover:bg-muted/70 flex-shrink-0">
                  <div className="flex items-center">学年 {getSortIcon('grade')}</div>
                </th>
                <th scope="col" onClick={() => requestSort('full_name')} className="px-3 py-3.5 text-left text-sm font-semibold text-foreground whitespace-nowrap cursor-pointer hover:bg-muted/70">
                  <div className="flex items-center">氏名 {getSortIcon('full_name')}</div>
                </th>
                <th scope="col" onClick={() => requestSort('age')} className="px-3 py-3.5 text-left text-sm font-semibold text-foreground whitespace-nowrap cursor-pointer hover:bg-muted/70">
                  <div className="flex items-center">年齢 {getSortIcon('age')}</div>
                </th>
                <th scope="col" onClick={() => requestSort('birthday')} className="px-3 py-3.5 text-left text-sm font-semibold text-foreground whitespace-nowrap cursor-pointer hover:bg-muted/70">
                  <div className="flex items-center">生年月日 {getSortIcon('birthday')}</div>
                </th>
                <th scope="col" onClick={() => requestSort('gender')} className="px-3 py-3.5 text-left text-sm font-semibold text-foreground whitespace-nowrap cursor-pointer hover:bg-muted/70">
                  <div className="flex items-center">性別 {getSortIcon('gender')}</div>
                </th>
                <th scope="col" onClick={() => requestSort('last_name')} className="px-3 py-3.5 text-left text-sm font-semibold text-foreground whitespace-nowrap cursor-pointer hover:bg-muted/70">
                  <div className="flex items-center">苗字 {getSortIcon('last_name')}</div>
                </th>
                <th scope="col" onClick={() => requestSort('first_name')} className="px-3 py-3.5 text-left text-sm font-semibold text-foreground whitespace-nowrap cursor-pointer hover:bg-muted/70">
                  <div className="flex items-center">名前 {getSortIcon('first_name')}</div>
                </th>
                <th scope="col" onClick={() => requestSort('last_name_kana')} className="px-3 py-3.5 text-left text-sm font-semibold text-foreground whitespace-nowrap cursor-pointer hover:bg-muted/70">
                  <div className="flex items-center">かな(姓) {getSortIcon('last_name_kana')}</div>
                </th>
                <th scope="col" onClick={() => requestSort('first_name_kana')} className="px-3 py-3.5 text-left text-sm font-semibold text-foreground whitespace-nowrap cursor-pointer hover:bg-muted/70">
                  <div className="flex items-center">かな(名) {getSortIcon('first_name_kana')}</div>
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-foreground whitespace-nowrap">アレルギー</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-foreground whitespace-nowrap">特記事項</th>
                <th scope="col" onClick={() => requestSort('parent_name')} className="px-3 py-3.5 text-left text-sm font-semibold text-foreground whitespace-nowrap cursor-pointer hover:bg-muted/70">
                  <div className="flex items-center">保護者 {getSortIcon('parent_name')}</div>
                </th>
                {canEdit && <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">操作</span></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-background">
              {allChildren.map((child, index) => (
                <tr key={child.id} className={`hover:bg-muted/50 ${getGradeOrder(child.grade) % 2 === 0 ? 'bg-background' : 'bg-muted/30'}`}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-foreground sm:pl-6">
                    {child.grade}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-foreground group">
                    <div className="flex items-center gap-1">
                      {child.full_name}
                      <CopyToClipboard text={child.full_name} />
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                    {child.age}歳
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                    {child.birthday ? new Date(child.birthday).toLocaleDateString('ja-JP') : '-'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                    {child.gender === 'male' ? '男' : child.gender === 'female' ? '女' : child.gender === 'other' ? '他' : '-'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      {child.last_name}
                      <CopyToClipboard text={child.last_name} />
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      {child.first_name}
                      <CopyToClipboard text={child.first_name} />
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      {child.last_name_kana}
                      <CopyToClipboard text={child.last_name_kana} />
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      {child.first_name_kana}
                      <CopyToClipboard text={child.first_name_kana} />
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-primary font-medium">
                    {child.allergy}
                  </td>
                  <td className=" px-3 py-4 text-sm text-muted-foreground min-w-[150px]">
                    {child.notes}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-primary hover:text-primary">
                    <Link href={`/admin/users/${child.parent_id}?view=child`}>
                      {child.parent_name}
                    </Link>
                  </td>
                  {canEdit && (
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                      <Link
                        href={`/admin/users/${child.parent_id}?view=child`}
                        className="text-primary hover:text-primary bg-primary/10 px-3 py-1 rounded-md text-xs font-medium border border-primary/20"
                      >
                        編集
                      </Link>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
