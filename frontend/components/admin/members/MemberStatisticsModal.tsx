'use client';

import { useMemo } from 'react';
import { calculateGrade, getGradeOrder } from '@/lib/grade-utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/ui/primitives/Dialog';
import { Baby } from 'lucide-react';

interface MemberStatisticsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  profiles: any[];
  targetFiscalYear: number;
}

export function MemberStatisticsModal({
  isOpen,
  onOpenChange,
  profiles,
  targetFiscalYear,
}: MemberStatisticsModalProps) {
  const stats = useMemo(() => {
    let totalChildren = 0;
    let elementaryCount = 0;
    const gradeCounts: Record<string, number> = {};

    profiles.forEach((profile) => {
      if (profile.children && Array.isArray(profile.children)) {
        profile.children.forEach((child: any) => {
          totalChildren++;
          const grade = calculateGrade(child.birthday, targetFiscalYear);
          gradeCounts[grade] = (gradeCounts[grade] || 0) + 1;
          if (grade.startsWith('小学')) {
            elementaryCount++;
          }
        });
      }
    });

    return { totalChildren, elementaryCount, gradeCounts };
  }, [profiles, targetFiscalYear]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>会員統計情報</DialogTitle>
          <DialogDescription>
            {targetFiscalYear}年度の会員登録状況です。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary/10 p-4 rounded-lg border border-primary/20 text-center">
              <span className="block text-sm text-primary font-medium mb-1">子供総数</span>
              <span className="block text-3xl font-bold text-foreground">{stats.totalChildren}名</span>
            </div>
            <div className="bg-muted p-4 rounded-lg border border-border text-center">
              <span className="block text-sm text-foreground font-medium mb-1">小学生総数</span>
              <span className="block text-3xl font-bold text-foreground">{stats.elementaryCount}名</span>
            </div>
          </div>

          {/* Detailed Table */}
          <div>
            <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <Baby className="h-4 w-4 text-primary" />
              学年別内訳
            </h4>
            <div className="rounded-md border border-border overflow-hidden">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-muted text-foreground border-b border-border">
                    <th className="text-left py-2 px-4 font-bold">学年</th>
                    <th className="text-right py-2 px-4 font-bold">人数</th>
                    <th className="text-right py-2 px-4 font-bold text-muted-foreground w-1/3">比率</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {Object.keys(stats.gradeCounts)
                    .sort((a, b) => getGradeOrder(a) - getGradeOrder(b))
                    .map((grade, index) => {
                      const count = stats.gradeCounts[grade];
                      const percentage = stats.totalChildren > 0
                        ? Math.round((count / stats.totalChildren) * 100)
                        : 0;

                      return (
                        <tr key={grade} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                          <td className="py-2 px-4 text-foreground font-medium">{grade}</td>
                          <td className="py-2 px-4 text-right font-bold">{count}名</td>
                          <td className="py-2 px-4 text-right text-muted-foreground text-xs">
                            {percentage}%
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/50 font-bold border-t border-border">
                    <td className="py-2 px-4 text-foreground">合計</td>
                    <td className="py-2 px-4 text-right text-foreground">{stats.totalChildren}名</td>
                    <td className="py-2 px-4"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
