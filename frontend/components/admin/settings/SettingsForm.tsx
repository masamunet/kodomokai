
'use client'

import { useState } from 'react'
import { updateSettings } from '@/app/admin/actions/settings'

type Props = {
  initialName: string
  initialStartMonth: number
  initialWarekiEraName: string
  initialWarekiStartYear: number
  initialAdmissionFee: number
  initialAnnualFee: number
}

export default function SettingsForm({ initialName, initialStartMonth, initialWarekiEraName, initialWarekiStartYear, initialAdmissionFee, initialAnnualFee }: Props) {
  const [message, setMessage] = useState<string | null>(null)

  // For preview
  const [eraName, setEraName] = useState(initialWarekiEraName)
  const [startYear, setStartYear] = useState(initialWarekiStartYear)

  const currentYear = new Date().getFullYear();
  const previewWarekiYear = currentYear - startYear + 1;
  const previewString = `${eraName}${previewWarekiYear === 1 ? '元' : previewWarekiYear}年`;

  const handleSubmit = async (formData: FormData) => {
    setMessage(null)
    const result = await updateSettings(formData)

    if (result?.success) {
      setMessage(result.message)
      setTimeout(() => setMessage(null), 3000)
    } else {
      setMessage(result?.message || 'エラーが発生しました')
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6 bg-white p-6 shadow sm:rounded-md">
      {message && (
        <div className={`border px-4 py-3 rounded ${message.includes('失敗') || message.includes('エラー') ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
          {message}
        </div>
      )}
      <div>
        <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
          会の名前
        </label>
        <div className="mt-2">
          <input
            type="text"
            name="name"
            id="name"
            defaultValue={initialName}
            required
            className="block w-full rounded-md border-0 py-1.5 p-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div>
        <label htmlFor="fiscal_year_start_month" className="block text-sm font-medium leading-6 text-gray-900">
          年度開始月
        </label>
        <p className="text-xs text-gray-500 mb-2">通常は4月です。</p>
        <div className="mt-2">
          <select
            id="fiscal_year_start_month"
            name="fiscal_year_start_month"
            defaultValue={initialStartMonth}
            className="block w-32 rounded-md border-0 py-1.5 p-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
              <option key={m} value={m}>{m}月</option>
            ))}
          </select>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-base font-semibold leading-7 text-gray-900 mb-4">会費設定</h3>
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label htmlFor="admission_fee" className="block text-sm font-medium leading-6 text-gray-900">
              入会金
            </label>
            <div className="mt-2 relative">
              <input
                type="number"
                name="admission_fee"
                id="admission_fee"
                defaultValue={initialAdmissionFee}
                min="0"
                className="block w-full rounded-md border-0 py-1.5 p-3 pr-8 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-gray-500 sm:text-sm">円</span>
              </div>
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="annual_fee" className="block text-sm font-medium leading-6 text-gray-900">
              年会費
            </label>
            <div className="mt-2 relative">
              <input
                type="number"
                name="annual_fee"
                id="annual_fee"
                defaultValue={initialAnnualFee}
                min="0"
                className="block w-full rounded-md border-0 py-1.5 p-3 pr-8 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-gray-500 sm:text-sm">円</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-base font-semibold leading-7 text-gray-900 mb-4">和暦設定</h3>
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label htmlFor="wareki_era_name" className="block text-sm font-medium leading-6 text-gray-900">
              元号名
            </label>
            <div className="mt-2">
              <input
                type="text"
                name="wareki_era_name"
                id="wareki_era_name"
                value={eraName}
                onChange={(e) => setEraName(e.target.value)}
                required
                className="block w-full rounded-md border-0 py-1.5 p-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="wareki_start_year" className="block text-sm font-medium leading-6 text-gray-900">
              開始年（西暦）
            </label>
            <p className="text-xs text-gray-500 mb-1">この元号が始まった最初の年（元年）</p>
            <div className="mt-2">
              <input
                type="number"
                name="wareki_start_year"
                id="wareki_start_year"
                value={startYear}
                onChange={(e) => setStartYear(parseInt(e.target.value) || 0)}
                required
                className="block w-full rounded-md border-0 py-1.5 p-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div className="sm:col-span-6 bg-gray-50 p-3 rounded text-sm text-gray-600">
            プレビュー: {currentYear}年は <strong>{previewString}</strong> です。
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          保存する
        </button>
      </div>
    </form>
  )
}
