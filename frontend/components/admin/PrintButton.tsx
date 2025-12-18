'use client'

import { Printer } from 'lucide-react'

export default function PrintButton({ label = '印刷 / PDF保存' }: { label?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded shadow-sm hover:bg-indigo-700 text-sm font-medium print:hidden"
    >
      <Printer size={16} />
      {label}
    </button>
  )
}
