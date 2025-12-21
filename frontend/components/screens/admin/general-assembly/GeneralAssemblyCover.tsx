'use client'

import { toWarekiYear } from "@/lib/date-utils"

// A simple component for the cover page
// No "use client" needed strictly if only props, but keeping consistent.

type Props = {
  year: number
  organizationName?: string
  eraName?: string
  startYear?: number
}

export function GeneralAssemblyCover({ year, organizationName, eraName, startYear }: Props) {
  const warekiYear = toWarekiYear(year, eraName || '令和', startYear || 2019)

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full text-center p-8 bg-white text-black font-serif">
      <div className="mt-32 mb-16">
        <p className="text-3xl tracking-widest mb-12">{warekiYear}度</p>
        <h1 className="text-6xl font-bold tracking-wider mb-16 leading-relaxed">
          {organizationName || '子ども会'}
          <br />
          <span className="text-5xl mt-4 block">総会資料</span>
        </h1>
      </div>

      <div className="mt-auto mb-32">
        <p className="text-xl border-t border-black pt-8 px-16 inline-block">
          発行日: {new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
    </div>
  )
}
