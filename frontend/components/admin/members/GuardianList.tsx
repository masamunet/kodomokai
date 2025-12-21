'use client';

import { useMemo, useState } from 'react';
import { calculateAge, calculateGrade } from '@/lib/grade-utils';
import Link from 'next/link';
import { Search, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { Input } from '@/ui/primitives/Input';
import { ClickableTableRow } from '@/components/admin/patterns/ClickableTableRow';

interface GuardianListProps {
  profiles: any[];
  targetFiscalYear: number;
  canEdit?: boolean;
}

export default function GuardianList({ profiles, targetFiscalYear, canEdit }: GuardianListProps) {

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({
    key: 'joined_at',
    direction: 'desc',
  });
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProfiles = useMemo(() => {
    let list = [...(profiles || [])];

    // Search filter
    if (searchQuery) {
      const s = searchQuery.toLowerCase();
      list = list.filter(p =>
        p.full_name?.toLowerCase().includes(s) ||
        p.last_name_kana?.includes(s) ||
        p.first_name_kana?.includes(s) ||
        p.email?.toLowerCase().includes(s) ||
        p.phone?.includes(s) ||
        p.address?.toLowerCase().includes(s)
      );
    }

    // Sort
    if (sortConfig) {
      list.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (sortConfig.key === 'joined_at') {
          valA = new Date(a.joined_at).getTime();
          valB = new Date(b.joined_at).getTime();
        }

        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [profiles, searchQuery, sortConfig]);

  const stats = useMemo(() => {
    if (!profiles) return { total: 0, householdCount: 0 }
    // Count 'households' - technically every profile in this list is a guardian/member
    // The user specifically asked: "Display count of guardians who have children registered as members"
    const householdCount = profiles.filter(p => p.children && p.children.length > 0).length;
    return {
      total: profiles.length,
      householdCount
    };
  }, [profiles]);

  if (!profiles || profiles.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">登録されている保護者（会員）はいません。</div>;
  }

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

  return (
    <div>
      {/* Statistics */}
      <div className="bg-background p-4 rounded-lg shadow-sm mb-6 border border-border">
        <h3 className="text-lg font-bold text-foreground mb-3">統計情報</h3>
        <div className="flex gap-4">
          <div className="bg-primary/10 p-3 rounded-md border border-primary/20 flex-1 md:flex-none md:w-64">
            <span className="block text-sm text-primary font-medium">会員世帯数</span>
            <span className="block text-2xl font-bold text-foreground">{stats.householdCount}世帯</span>
          </div>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="mt-6 mb-4 flex flex-col sm:flex-row gap-3 items-end justify-between px-4 sm:px-0">
        <div className="w-full sm:max-w-xs relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            type="text"
            placeholder="お名前、かな、メール等で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-xs text-muted-foreground italic mr-2 sm:mr-0">
          {filteredProfiles.length}名を表示中
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow-sm ring-1 ring-border sm:rounded-lg bg-background">
              {filteredProfiles.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  検索条件に一致する保護者は見つかりませんでした。
                </div>
              ) : (
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted/50">
                    <tr>
                      <th scope="col" onClick={() => requestSort('full_name')} className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-foreground sm:pl-6 cursor-pointer hover:bg-muted/70">
                        <div className="flex items-center">名前 (保護者) {getSortIcon('full_name')}</div>
                      </th>
                      <th scope="col" onClick={() => requestSort('email')} className="px-3 py-3.5 text-left text-sm font-semibold text-foreground cursor-pointer hover:bg-muted/70">
                        <div className="flex items-center">メールアドレス {getSortIcon('email')}</div>
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">
                        連絡先
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">
                        お子様
                      </th>
                      <th scope="col" onClick={() => requestSort('joined_at')} className="px-3 py-3.5 text-left text-sm font-semibold text-foreground cursor-pointer hover:bg-muted/70">
                        <div className="flex items-center">登録日 {getSortIcon('joined_at')}</div>
                      </th>
                      {canEdit && <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">操作</span></th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-background">
                    {filteredProfiles?.map((person, index) => (
                      <ClickableTableRow
                        key={person.id}
                        href={`/admin/users/${person.id}?view=guardian`}
                        className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}
                      >
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-foreground sm:pl-6">
                          <div>
                            {person.full_name || '未設定'}
                            {person.is_admin && <span className="ml-2 inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/15">管理者</span>}
                          </div>
                          <div className="text-xs text-muted-foreground">
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
                                  <span className="text-xs text-muted-foreground ml-1">({child.last_name_kana} {child.first_name_kana})</span>
                                  <span className="ml-1 text-muted-foreground">
                                    - {child.gender === 'male' ? '男' : child.gender === 'female' ? '女' : '他'}
                                    {child.birthday && ` ${calculateGrade(child.birthday, targetFiscalYear)} (${calculateAge(child.birthday, targetFiscalYear)}歳)`}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-muted-foreground">登録なし</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                          {new Date(person.joined_at).toLocaleDateString()}
                        </td>
                        {canEdit && (
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                            <span
                              className="text-primary hover:text-primary bg-primary/10 px-3 py-1 rounded-md text-xs font-medium border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                            >
                              詳細
                            </span>
                          </td>
                        )}
                      </ClickableTableRow>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}
