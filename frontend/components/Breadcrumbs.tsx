'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { Box } from '@/ui/layout/Box'
import { HStack } from '@/ui/layout/Stack'
import { Text } from '@/ui/primitives/Text'

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
      return null
    }

    return { href, label, isLast: index === segments.length - 1 }
  }).filter(Boolean)

  if (pathname === '/admin') return null;

  return (
    <nav aria-label="Breadcrumb">
      <HStack className="items-center text-xs text-muted-foreground">
        <Link href="/admin" className="flex items-center hover:text-primary transition-colors">
          <Home className="h-3 w-3" />
        </Link>
        {crumbs.map((crumb: any) => (
          <HStack key={crumb.href} className="items-center">
            <ChevronRight className="h-3 w-3 mx-1.5 text-muted-foreground/30" />
            {crumb.isLast ? (
              <Text weight="bold" className="text-foreground">{crumb.label}</Text>
            ) : (
              <Link href={crumb.href} className="hover:text-primary transition-colors">
                {crumb.label}
              </Link>
            )}
          </HStack>
        ))}
      </HStack>
    </nav>
  )
}
