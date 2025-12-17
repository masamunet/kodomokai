
import Link from 'next/link'
import { Plus } from 'lucide-react'

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
}

export default function AdminPageHeader({ title, description, action }: AdminPageHeaderProps) {
  return (
    <div className="sm:flex sm:items-center sm:justify-between mb-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {description && (
          <p className="mt-2 text-sm text-gray-600">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            href={action.href}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <span className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {action.label}
            </span>
          </Link>
        </div>
      )}
    </div>
  )
}
