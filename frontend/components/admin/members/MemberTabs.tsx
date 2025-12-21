'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LayoutList, Users, UserCog } from 'lucide-react';

interface MemberTabsProps {
  children?: ReactNode;
}

export default function MemberTabs({ children }: MemberTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentView = searchParams.get('view') || 'child';

  const tabs = [
    { id: 'child', name: '子供', icon: LayoutList },
    { id: 'guardian', name: '保護者', icon: Users },
    { id: 'officer', name: '役員', icon: UserCog },
  ];

  const handleTabClick = (view: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('view', view);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border mb-6 gap-4">
      <nav className="-mb-px flex space-x-1" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = currentView === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                "group relative min-w-[100px] flex items-center justify-center py-3 px-4 font-medium text-sm rounded-t-lg border-b-2 transition-all duration-200",
                isActive
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className={cn("w-4 h-4 mr-2", isActive ? "text-primary" : "text-muted-foreground")} />
              {tab.name}
            </button>
          );
        })}
      </nav>

      {children && (
        <div className="pb-2 sm:pb-0">
          {children}
        </div>
      )}
    </div>
  );
}
