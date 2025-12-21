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
    <div className="space-y-12">
      <div className="relative max-w-md">
        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isPending ? 'text-white animate-pulse' : 'text-indigo-300'}`} size={20} />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="キーワードで検索"
          className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-indigo-200 focus:outline-none focus:bg-white/20 transition-all backdrop-blur-md"
        />
        {inputValue && (
          <button
            onClick={() => setInputValue('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-300 hover:text-white transition-colors p-1"
            title="検索をクリア"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mt-12 px-2 -mx-2">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          最近の質問
        </h3>
      </div>
    </div>
  )
}
