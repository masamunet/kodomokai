'use client'

import { useState } from 'react'
import { importUsers, importChildren } from '@/app/actions/admin'
import { Loader2, AlertCircle, CheckCircle, Users, Baby } from 'lucide-react'
import { getGradeOrder } from '@/lib/grade-utils'

type ImportMode = 'user' | 'child'

export default function BulkImportPage() {
  const [importMode, setImportMode] = useState<ImportMode>('user')
  const [csvContent, setCsvContent] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    createdCount: number
    failedCount: number
    logs: string[]
    gradeSummary?: Record<string, number>
  } | null>(null)

  const handleImport = async () => {
    if (!csvContent.trim()) return
    const modeName = importMode === 'user' ? '会員' : '子供'
    if (!confirm(`${modeName}の一括登録を開始しますか？\n※1件でも失敗すると全件ロールバック（取り消し）されます。`)) return

    console.log(`[BulkImportPage] Starting import. mode=${importMode}, lines=${csvContent.split('\n').length}`)
    setIsProcessing(true)
    setResult(null)

    try {
      let res;
      if (importMode === 'user') {
        console.log('[BulkImportPage] Calling importUsers...')
        res = await importUsers(csvContent)
      } else {
        console.log('[BulkImportPage] Calling importChildren...')
        res = await importChildren(csvContent)
      }
      console.log('[BulkImportPage] Action returned:', res)
      setResult(res)
    } catch (e: any) {
      console.error('[BulkImportPage] Error in handleImport:', e)
      alert(`エラーが発生しました: ${e.message || '不明なエラー'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">データ一括登録</h2>
      </div>

      <div className="flex gap-4 border-b">
        <button
          onClick={() => { setImportMode('user'); setResult(null); }}
          className={`pb-2 px-4 flex items-center gap-2 font-medium transition-colors ${importMode === 'user' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          <Users size={18} />
          会員（保護者）登録
        </button>
        <button
          onClick={() => { setImportMode('child'); setResult(null); }}
          className={`pb-2 px-4 flex items-center gap-2 font-medium transition-colors ${importMode === 'child' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          <Baby size={18} />
          子供登録
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <div className="bg-blue-50 p-4 rounded text-sm text-blue-800">
          <p className="font-bold mb-2">
            {importMode === 'user' ? '会員CSV形式（ヘッダーなし）' : '子供CSV形式（ヘッダーなし）'}
          </p>
          <code className="block bg-white p-2 rounded border border-blue-200 overflow-x-auto whitespace-nowrap">
            {importMode === 'user'
              ? 'email,password,last_name,first_name,last_name_kana,first_name_kana'
              : 'parent_email,last_name,first_name,last_name_kana,first_name_kana,gender,birthday,allergies,notes'
            }
          </code>
          <p className="mt-2 text-xs">
            {importMode === 'user' ? (
              <>
                例: user1@example.com,pass1234,山田,太郎,やまだ,たろう<br />
                (カタカナは自動的にひらがなに変換されます)
              </>
            ) : (
              <>
                例: user1@example.com,山田,一郎,やまだ,いちろう,male,2015-04-01,卵アレルギー,特記事項<br />
                ※1列目は登録済みの保護者のメールアドレスを指定してください。
              </>
            )}
          </p>
          <p className="mt-2 text-xs text-red-600 font-bold">
            {importMode === 'user' && '※注意: パスワードはそのまま設定されます。取り扱いに注意してください。'}
            <br />
            ※1件でもエラーが発生した場合、全件の登録が取り消されます。
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">CSVデータ貼り付け（カンマ、スペース、タブ区切り対応）</label>
          <textarea
            className="w-full h-64 p-3 border border-gray-300 rounded font-mono text-sm"
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
            {importMode === 'user' ? '会員一括登録を実行' : '子供一括登録を実行'}
          </button>
        </div>
      </div>

      {result && (
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="font-bold">実行結果</h3>
            {!result.success && (
              <span className="text-red-600 font-bold text-sm bg-red-50 px-2 py-1 rounded">
                ロールバック済み（全件取り消し）
              </span>
            )}
          </div>
          <div className="flex gap-4">
            <div className={`flex items-center gap-2 ${result.success ? 'text-green-600' : 'text-gray-400'}`}>
              <CheckCircle size={20} />
              <span className="font-bold">成功: {result.createdCount}件</span>
            </div>
            <div className={`flex items-center gap-2 ${result.success ? 'text-gray-400' : 'text-red-600'}`}>
              <AlertCircle size={20} />
              <span className="font-bold">
                {result.success ? '失敗/スキップ: 0件' : `失敗による中断: ${result.failedCount}件`}
              </span>
            </div>
          </div>

          {result.gradeSummary && Object.keys(result.gradeSummary).length > 0 && (
            <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100 space-y-3">
              <h4 className="font-bold text-indigo-900 flex items-center gap-2">
                <Baby size={18} />
                登録お子様の学年別内訳
              </h4>
              <div className="bg-white rounded border border-indigo-200 overflow-hidden">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-indigo-100 text-indigo-900">
                      <th className="text-left py-2 px-4 font-bold">学年</th>
                      <th className="text-right py-2 px-4 font-bold">人数</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-indigo-50">
                    {Object.entries(result.gradeSummary)
                      .sort(([a], [b]) => getGradeOrder(a) - getGradeOrder(b))
                      .map(([grade, count], index) => (
                        <tr key={grade} className={`hover:bg-indigo-50/50 ${index % 2 === 0 ? 'bg-white' : 'bg-indigo-50/30'}`}>
                          <td className="py-2 px-4 text-gray-700">{grade}</td>
                          <td className="py-2 px-4 text-right font-medium text-indigo-700">{count}名</td>
                        </tr>
                      ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-indigo-50 font-bold border-t-2 border-indigo-100">
                      <td className="py-2 px-4 text-indigo-900">合計</td>
                      <td className="py-2 px-4 text-right text-indigo-900">{result.createdCount}名</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          <div className={`bg-gray-50 p-4 rounded border h-64 overflow-y-auto font-mono text-xs ${!result.success ? 'border-red-200' : ''}`}>
            {result.logs.map((log, i) => (
              <div key={i} className={
                log.includes('[FATAL ERROR]') || log.includes('[ERROR]') ? 'text-red-600 font-bold' :
                  log.includes('[SUCCESS]') ? 'text-green-600' :
                    'text-gray-600'
              }>
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
