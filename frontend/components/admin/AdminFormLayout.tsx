
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface AdminFormLayoutProps {
  children: React.ReactNode;
  title: string;
  backLink: {
    label?: string;
    href: string;
  };
  description?: string; // Optional context about what is being edited
}

export default function AdminFormLayout({ children, title, backLink, description }: AdminFormLayoutProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href={backLink.href}
          className="group inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          {backLink.label || '一覧に戻る'}
        </Link>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
