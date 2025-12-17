'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Eye, Edit, AlertCircle } from 'lucide-react'

type Props = {
  name: string
  defaultValue?: string
  placeholder?: string
  rows?: number
}

export default function MarkdownEditor({ name, defaultValue = '', placeholder, rows = 5 }: Props) {
  const [content, setContent] = useState(defaultValue)
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')

  return (
    <div className="border border-input rounded-md overflow-hidden bg-background">
      <div className="flex items-center gap-1 border-b border-border bg-muted/30 px-2 py-1.5">
        <button
          type="button"
          onClick={() => setActiveTab('write')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded text-sm font-medium transition-colors ${activeTab === 'write'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
        >
          <Edit size={14} />
          編集
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded text-sm font-medium transition-colors ${activeTab === 'preview'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
        >
          <Eye size={14} />
          プレビュー
        </button>
        <div className="flex-1" />
        <a
          href="https://docs.github.com/ja/get-started/writing-on-github"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
        >
          <AlertCircle size={12} />
          Markdown対応
        </a>
      </div>

      <div className="relative">
        <textarea
          name={name}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={`w-full p-4 bg-background text-foreground focus:outline-none resize-y min-h-[150px] font-mono text-sm ${activeTab === 'write' ? 'block' : 'hidden'
            }`}
        />

        {activeTab === 'preview' && (
          <div className="w-full p-4 min-h-[150px] prose prose-sm dark:prose-invert max-w-none overflow-y-auto bg-background">
            {content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            ) : (
              <span className="text-muted-foreground italic">プレビューする内容がありません</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
