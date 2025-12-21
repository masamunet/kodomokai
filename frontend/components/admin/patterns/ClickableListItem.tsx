import { ReactNode } from 'react'
import Link from 'next/link'
import { Box } from '@/ui/layout/Box'
import { cn } from '@/lib/utils'

interface ClickableListItemProps {
  href: string
  children: ReactNode
  className?: string
  active?: boolean
}

export function ClickableListItem({
  href,
  children,
  className,
  active = false
}: ClickableListItemProps) {
  return (
    <Link href={href} className="block group no-underline">
      <Box
        className={cn(
          "p-4 border rounded-lg transition-all duration-200 cursor-pointer",
          "bg-card border-border",
          "hover:bg-muted/50 hover:border-muted-foreground/20 hover:shadow-sm",
          "group-hover:border-primary/50 group-active:scale-[0.98]",
          active && "bg-muted border-primary/50 ring-1 ring-primary/20",
          className
        )}
      >
        {children}
      </Box>
    </Link>
  )
}
