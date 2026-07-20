import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { canAccessRoute, type UserRole } from '@/lib/auth/rbac-rules'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
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
  // getUser(). A simple mistake can make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Skip redirect for API routes - they handle their own auth
  const isApiRoute = request.nextUrl.pathname.startsWith('/api')
  const pathname = request.nextUrl.pathname

  if (
    !user &&
    !isApiRoute &&
    !pathname.startsWith('/login') &&
    !pathname.startsWith('/auth') &&
    !pathname.startsWith('/portal/accept') &&
    !pathname.startsWith('/client') &&
    !isPublicPage(pathname)
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Enforce ADMIN/STAFF for /admin/* (CLIENT redirected to portal)
  if (user && !isApiRoute && pathname.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const role = ((profile?.role || 'CLIENT').toString().toUpperCase().trim()) as UserRole

    if (!canAccessRoute(role, pathname)) {
      const url = request.nextUrl.clone()
      url.pathname = role === 'CLIENT' ? '/portal' : '/login'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

function isPublicPage(pathname: string) {
  const publicPages = [
    '/',
    '/services',
    '/services-preview',
    '/company',
    '/brands',
    '/support',
    '/privacy',
    '/login',
    '/portal/accept',
    '/client',
    '/directory',
    '/api/directory',
    '/offline',
  ];
  if (publicPages.some(page => pathname === page || pathname.startsWith(page + '/'))) {
    return true;
  }
  // PWA assets must be public (no auth redirect → HTML masquerading as JSON)
  if (
    pathname === '/manifest.webmanifest' ||
    pathname === '/manifest.json' ||
    pathname === '/sw.js' ||
    pathname.startsWith('/icons/') ||
    pathname === '/icon.svg' ||
    pathname === '/offline/'
  ) {
    return true;
  }
  return false;
}
