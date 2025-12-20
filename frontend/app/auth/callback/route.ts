import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getBaseUrl } from '@/lib/utils'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && user) {
      // Check if profile is complete
      const { data: profile } = await supabase
        .from('profiles')
        .select('last_name, first_name, address')
        .eq('id', user.id)
        .single()

      const baseUrl = getBaseUrl()

      if (!profile?.last_name || !profile?.first_name || !profile?.address) {
        return NextResponse.redirect(`${baseUrl}/register/onboarding`)
      }

      return NextResponse.redirect(`${baseUrl}${next}`)
    }
  }

  // return the user to an error page with instructions
  const baseUrl = getBaseUrl()
  return NextResponse.redirect(`${baseUrl}/auth/auth-code-error`)
}
