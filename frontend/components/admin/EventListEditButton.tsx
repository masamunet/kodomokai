'use client'

import Link from 'next/link'
import { Edit } from 'lucide-react'

export default function EventListEditButton({ eventId }: { eventId: string }) {
  return (
    <Link
      href={`/admin/events/${eventId}/edit`}
      className="text-gray-400 hover:text-indigo-600 p-1 hover:bg-indigo-50 rounded z-10 block"
      title="編集"
      onClick={(e) => e.stopPropagation()}
    >
      <Edit size={16} />
    </Link>
  )
}
