
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Define public paths strictly
  const isPublic =
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/auth') ||
    pathname === '/register' ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/update-password')

  const isOnboarding = pathname.startsWith('/register/onboarding')

  // 1. If no user, only allow public paths
  if (!user) {
    if (!isPublic) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'

      // IMPORTANT: Even when redirecting, we must carry over the updated cookies
      const response = NextResponse.redirect(url)
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        const { name, value, ...options } = cookie
        response.cookies.set(name, value, options)
      })
      return response
    }
    return supabaseResponse
  }

  // 2. If user exists, check if profile is complete
  if (!isOnboarding && !pathname.startsWith('/auth')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('last_name, first_name, address')
      .eq('id', user.id)
      .single()

    if (!profile?.last_name || !profile?.first_name || !profile?.address) {
      const url = request.nextUrl.clone()
      url.pathname = '/register/onboarding'

      // IMPORTANT: carry over the updated cookies
      const response = NextResponse.redirect(url)
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        const { name, value, ...options } = cookie
        response.cookies.set(name, value, options)
      })
      return response
    }
  }

  return supabaseResponse
}
