'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface ClickableTableRowProps {
  href: string
  children: ReactNode
  className?: string
}

/**
 * A table row component that is clickable and navigates to the given href.
 * Uses router.push for navigation to avoid wrapping tr in a Link (which is invalid HTML).
 */
export function ClickableTableRow({
  href,
  children,
  className
}: ClickableTableRowProps) {
  const router = useRouter()

  const handleClick = (e: React.MouseEvent) => {
    // If the click was on a button or link inside the row, don't trigger the row click
    const target = e.target as HTMLElement
    if (
      target.closest('button') ||
      target.closest('a') ||
      target.closest('input') ||
      target.closest('select')
    ) {
      return
    }

    router.push(href)
  }

  return (
    <tr
      onClick={handleClick}
      className={cn(
        "cursor-pointer hover:bg-muted/70 transition-colors group",
        className
      )}
    >
      {children}
    </tr>
  )
}
