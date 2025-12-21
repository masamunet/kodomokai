
import { cookies } from 'next/headers'

const COOKIE_NAME = 'target_fiscal_year'

// Get the target fiscal year. Defaults to current fiscal year if not set.
// Current fiscal year logic: If month >= 4, use current year. Else use current year - 1.
// (Assuming 4 is the start month, but we should Ideally fetch from settings. For now, hardcode 4 or fetch?)
// Fetching settings in every request might be slow. Let's assume standard Japan April start for default logic,
// but respect the cookie if set.
export async function getTargetFiscalYear() {
  const cookieStore = await cookies()
  const val = cookieStore.get(COOKIE_NAME)?.value
  if (val) return parseInt(val)

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1 // 1-12

  // Default to April start
  return month >= 4 ? year : year - 1
}

// Fixed unused variable "year" by simply removing the parameter or using it.
// Since this function is a stub, we can just comment out the parameter or use _year.
export async function setTargetFiscalYear() {
  // This needs to be a Server Action or called from one
}
