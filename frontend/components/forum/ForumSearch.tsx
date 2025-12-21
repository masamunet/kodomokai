'use client'

import { useState, useTransition, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { useDebounce } from '@/lib/hooks/use-debounce'

export default function ForumSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentQuery = searchParams.get('q') || ''
  const [inputValue, setInputValue] = useState(currentQuery)
  const debouncedValue = useDebounce(inputValue, 500)

  const updateParams = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    startTransition(() => {
      router.push(`/forum?${params.toString()}`)
    })
  }, [searchParams, router])

  useEffect(() => {
    if (debouncedValue !== currentQuery) {
      updateParams('q', debouncedValue)
    }
  }, [debouncedValue, currentQuery, updateParams])

  return (
    <div className="relative max-w-lg w-full">
      <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isPending ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} size={20} />
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="キーワードで検索"
        className="w-full bg-background border border-input rounded-full py-3 pl-12 pr-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
      />
      {inputValue && (
        <button
          onClick={() => setInputValue('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
          title="検索をクリア"
        >
          <X size={18} />
        </button>
      )}
    </div>
  )
}
