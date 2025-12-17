
'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function switchFiscalYear(year: number) {
  const cookieStore = await cookies()
  cookieStore.set('target_fiscal_year', year.toString())
  revalidatePath('/') // Revalidate everything
}
