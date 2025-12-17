
'use client'

import { switchFiscalYear } from '../app/actions/common'

export default function FiscalYearSwitcher({
  currentYear,
  theme = 'light'
}: {
  currentYear: number
  theme?: 'light' | 'dark'
}) {
  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(e.target.value)
    await switchFiscalYear(year)
  }

  const baseYear = new Date().getFullYear()
  const years = [baseYear - 2, baseYear - 1, baseYear, baseYear + 1]

  const labelClass = theme === 'dark' ? 'text-sidebar-foreground' : 'text-muted-foreground'
  const selectClass = theme === 'dark'
    ? 'text-sm border-gray-200 bg-gray-50 text-sidebar-foreground rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 py-1'
    : 'text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 py-1'

  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs hidden sm:inline ${labelClass}`}>対象年度:</span>
      <select
        value={currentYear}
        onChange={handleChange}
        className={selectClass}
      >
        {years.map(y => (
          <option key={y} value={y}>{y}年度</option>
        ))}
      </select>
    </div>
  )
}
