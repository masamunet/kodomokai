'use client'

import { useState } from 'react'
import { Link, Check } from 'lucide-react'

export default function CopyLinkButton({ meetingId }: { meetingId: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const url = `${window.location.origin}/admin/meetings/${meetingId}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 px-2 py-1 text-sm rounded transition-colors ${copied
          ? 'bg-green-100 text-green-700'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        }`}
      title="この定例会のURLをコピー"
    >
      {copied ? <Check size={16} /> : <Link size={16} />}
      {copied ? 'コピーしました' : 'URLをコピー'}
    </button>
  )
}
