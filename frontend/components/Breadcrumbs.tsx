
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

const LABEL_MAP: Record<string, string> = {
  admin: 'ダッシュボード',
  members: '会員名簿',
  events: 'イベント',
  officers: '役員任命',
  roles: '役職管理',
  templates: 'テンプレート',
  notifications: 'お知らせ配信',
  settings: '設定',
  new: '新規作成',
}

const isUuid = (str: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export default function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  // Generate crumbs
  const crumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join('/')}`

    let label = LABEL_MAP[segment] || segment

    // Fallback for IDs
    if (isUuid(segment) || !isNaN(Number(segment))) {
      label = '詳細・編集'
    }

    // Special case for root 'admin'
    if (segment === 'admin' && segments.length === 1) {
      return null // Don't show redundant 'Dashboard' if we are on dashboard root, or maybe we do? 
      // Let's keep it consistent: Home > Dashboard > ...
    }

    return { href, label, isLast: index === segments.length - 1 }
  }).filter(Boolean)

  if (pathname === '/admin') return null;

  return (
    <nav className="flex items-center text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
      <Link href="/admin" className="flex items-center hover:text-foreground transition-colors">
        <Home className="h-4 w-4" />
      </Link>
      {crumbs.map((crumb: any, index) => (
        <div key={crumb.href} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/50" />
          {crumb.isLast ? (
            <span className="font-medium text-foreground">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-foreground transition-colors">
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
