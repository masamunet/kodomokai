'use client'

import { useState, useTransition } from 'react'
import { Printer, Save, FileText, Calendar, History } from 'lucide-react'
import MarkdownEditor from '@/components/ui/MarkdownEditor'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { upsertConstitution } from '@/app/admin/actions/constitution'

type Constitution = {
  id: string
  title: string
  content: string
  version_date: string
  version_name: string | null
  updated_at: string
}

type Props = {
  initialData: Constitution | null
}

export default function ConstitutionEditor({ initialData }: Props) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [content, setContent] = useState(initialData?.content || '')

  const handleSubmit = async (formData: FormData) => {
    setMessage(null)
    startTransition(async () => {
      const result = await upsertConstitution(formData)
      if (result.success) {
        setMessage({ type: 'success', text: result.message })
      } else {
        setMessage({ type: 'error', text: result.message })
      }
    })
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Alert Message */}
      {message && (
        <div className={`p-4 rounded-md border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
          }`}>
          {message.text}
        </div>
      )}

      {/* Editor Controls - Hidden on Print */}
      <div className="bg-white p-6 shadow sm:rounded-md border border-gray-200 print:hidden">
        <form action={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FileText size={16} className="text-gray-400" />
                規約タイトル
              </label>
              <input
                type="text"
                name="title"
                defaultValue={initialData?.title || '規約'}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                施行日 / 改定日
              </label>
              <input
                type="date"
                name="version_date"
                defaultValue={initialData?.version_date || new Date().toISOString().split('T')[0]}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <History size={16} className="text-gray-400" />
                版数 (任意)
              </label>
              <input
                type="text"
                name="version_name"
                defaultValue={initialData?.version_name || ''}
                placeholder="例: 第1版、2025年度改訂版"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              規約内容 (Markdown)
            </label>
            <MarkdownEditor
              name="content"
              defaultValue={content}
              rows={20}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md shadow-sm hover:bg-gray-50 font-medium text-sm transition-colors"
            >
              <Printer size={18} />
              印刷 / PDFプレビュー
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 font-bold text-sm disabled:opacity-50 transition-colors"
            >
              <Save size={18} />
              {isPending ? '保存中...' : '規約を保存'}
            </button>
          </div>
        </form>
      </div>

      {/* Print View / Preview - Inspired by AnnualSchedule (optimized for printing) */}
      <div className="bg-white p-8 shadow sm:rounded-md border border-gray-200 print:shadow-none print:border-none print:p-0">
        <div className="max-w-3xl mx-auto">
          {/* Print Header */}
          <div className="border-b-2 border-black pb-4 mb-8 text-center print:pt-4">
            <h1 className="text-2xl font-bold text-gray-900">{initialData?.title || '規約'}</h1>
            <div className="mt-2 flex justify-between text-sm text-gray-500">
              <span>{initialData?.version_name}</span>
              <span>施行日: {initialData?.version_date ? new Date(initialData.version_date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</span>
            </div>
          </div>

          {/* Constitution Content */}
          <div className="prose prose-slate max-w-none print:prose-sm print:text-black">
            {initialData?.content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {initialData.content}
              </ReactMarkdown>
            ) : (
              <div className="text-center py-12 text-gray-400 italic print:hidden">
                まだ規約が登録されていません。上のエディタで入力してください。
              </div>
            )}
          </div>

          {/* Print Footer */}
          <div className="mt-12 pt-4 border-t border-gray-100 text-right text-xs text-gray-400 print:border-black print:text-black font-serif">
            <div>以上</div>
            <div className="mt-1">最終更新日: {initialData?.updated_at ? new Date(initialData.updated_at).toLocaleString('ja-JP') : '-'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
