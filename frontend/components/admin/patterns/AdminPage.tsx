import { ReactNode } from 'react'
import { Box } from '@/ui/layout/Box'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import Breadcrumbs from '@/components/Breadcrumbs'
import { cn } from '@/lib/utils'

interface AdminPageRootProps {
  children: ReactNode
  className?: string
  maxWidth?: '5xl' | '7xl' | 'full'
}

function AdminPageRoot({ children, className, maxWidth = '7xl' }: AdminPageRootProps) {
  const maxWidthClass = {
    '5xl': 'max-w-5xl',
    '7xl': 'max-w-7xl',
    'full': 'max-w-full'
  }[maxWidth]

  return (
    <Box className={cn(maxWidthClass, "mx-auto p-6 transition-all duration-300", className)}>
      {children}
    </Box>
  )
}

interface AdminPageHeaderWrapperProps {
  title: string
  description?: string
  action?: {
    label: string
    href: string
  }
  showBreadcrumbs?: boolean
  className?: string
}

function AdminPageHeaderWrapper({
  title,
  description,
  action,
  showBreadcrumbs = true,
  className
}: AdminPageHeaderWrapperProps) {
  return (
    <Box className={className}>
      {showBreadcrumbs && (
        <Box className="mb-4">
          <Breadcrumbs />
        </Box>
      )}
      <AdminPageHeader title={title} description={description} action={action} />
    </Box>
  )
}

function AdminPageContent({ children, className }: { children: ReactNode, className?: string }) {
  return (
    <Box className={cn("space-y-6", className)}>
      {children}
    </Box>
  )
}

export const AdminPage = {
  Root: AdminPageRoot,
  Header: AdminPageHeaderWrapper,
  Content: AdminPageContent
}
