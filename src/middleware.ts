import { createMiddlewareClient } from './lib/supabase'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected and public routes
const protectedRoutes = ['/home', '/profiles', '/add-relationship', '/insights', '/settings']
const authRoutes = ['/auth', '/auth/callback']
const publicRoutes = ['/', '/onboarding']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Create Supabase client
  const supabase = createMiddlewareClient(request)
  
  // Get session
  const { data: { session } } = await supabase.auth.getSession()
  
  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.includes(pathname)
  
  // Redirect logic
  if (isProtectedRoute && !session) {
    // Redirect to auth if trying to access protected route without session
    return NextResponse.redirect(new URL('/auth', request.url))
  }
  
  if (isAuthRoute && session) {
    // Check if user has completed onboarding
    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()
    
    if (!userProfile) {
      // User exists but no profile, redirect to onboarding
      return NextResponse.redirect(new URL('/onboarding', request.url))
    } else {
      // User has profile, redirect to home
      return NextResponse.redirect(new URL('/home', request.url))
    }
  }
  
  // Handle root route
  if (pathname === '/') {
    if (session) {
      // Check if user has completed onboarding
      const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      if (!userProfile) {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      } else {
        return NextResponse.redirect(new URL('/home', request.url))
      }
    } else {
      return NextResponse.redirect(new URL('/auth', request.url))
    }
  }
  
  // Handle onboarding route
  if (pathname === '/onboarding') {
    if (!session) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }
    
    // Check if user already has a profile
    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()
    
    if (userProfile) {
      // User already has profile, redirect to home
      return NextResponse.redirect(new URL('/home', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}