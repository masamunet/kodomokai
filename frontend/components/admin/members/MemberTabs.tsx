'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export default function MemberTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentView = searchParams.get('view') || 'child';

  const tabs = [
    { id: 'child', name: '子供' },
    { id: 'guardian', name: '保護者' },
    { id: 'officer', name: '役員' },
  ];

  const handleTabClick = (view: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('view', view);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="border-b border-border mb-6">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${currentView === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }
            `}
            aria-current={currentView === tab.id ? 'page' : undefined}
          >
            {tab.name}
          </button>
        ))}
      </nav>
    </div>
  );
}
