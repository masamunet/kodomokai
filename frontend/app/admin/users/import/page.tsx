'use client'

import { useState } from 'react'
import { importUsers } from '@/app/actions/admin'
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react'

export default function BulkImportPage() {
  const [csvContent, setCsvContent] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{
    createdCount: number
    failedCount: number
    logs: string[]
  } | null>(null)

  const handleImport = async () => {
    if (!csvContent.trim()) return
    if (!confirm('一括登録を開始しますか？\n※既存のメールアドレスはエラーになります。')) return

    setIsProcessing(true)
    setResult(null)

    try {
      const res = await importUsers(csvContent)
      setResult({
        createdCount: res.createdCount,
        failedCount: res.failedCount,
        logs: res.logs
      })
    } catch (e) {
      alert('エラーが発生しました')
      console.error(e)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">会員一括登録</h2>
      </div>

      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <div className="bg-blue-50 p-4 rounded text-sm text-blue-800">
          <p className="font-bold mb-2">CSVフォーマット（ヘッダーなし）</p>
          <code className="block bg-white p-2 rounded border border-blue-200">
            email,password,last_name,first_name,last_name_kana,first_name_kana
          </code>
          <p className="mt-2 text-xs">
            例:<br />
            user1@example.com,pass1234,山田,太郎,やまだ,たろう<br />
            user2@example.com,pass1234,鈴木,花子,スズキ,ハナコ<br />
            (カタカナは自動的にひらがなに変換されます)
          </p>
          <p className="mt-2 text-xs text-red-600 font-bold">
            ※注意: パスワードはそのまま設定されます。取り扱いに注意してください。<br />
            ※ユーザーには通知メールは送信されません。
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">CSVデータ貼り付け</label>
          <textarea
            className="w-full h-64 p-3 border border-gray-300 roundedfont-mono text-sm"
            placeholder="ここにCSVデータを貼り付けてください"
            value={csvContent}
            onChange={(e) => setCsvContent(e.target.value)}
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleImport}
            disabled={isProcessing || !csvContent.trim()}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {isProcessing && <Loader2 className="animate-spin h-4 w-4" />}
            一括登録を実行
          </button>
        </div>
      </div>

      {result && (
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h3 className="font-bold border-b pb-2">実行結果</h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle size={20} />
              <span className="font-bold">成功: {result.createdCount}件</span>
            </div>
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle size={20} />
              <span className="font-bold">失敗/スキップ: {result.failedCount}件</span>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded border h-64 overflow-y-auto font-mono text-xs">
            {result.logs.map((log, i) => (
              <div key={i} className={log.includes('[ERROR]') ? 'text-red-600' : log.includes('[SUCCESS]') ? 'text-green-600' : 'text-gray-600'}>
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
