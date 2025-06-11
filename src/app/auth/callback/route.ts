import { logger } from '@/lib/logger'
import { createRouteHandlerClient } from '@/lib/supabase'
import { createUserProfile } from '@/lib/auth/server-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createRouteHandlerClient(request)
    
    try {
      const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        logger.error('Auth callback error:', error.message || error)
        return NextResponse.redirect(new URL('/auth?error=auth_callback_error', requestUrl.origin))
      }
      
      if (session?.user) {
        // Check if user profile exists
        const { data: existingProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (!existingProfile) {
          // Create user profile if it doesn't exist
          const { error: profileError } = await createUserProfile(session.user, request)
          
          if (profileError) {
            logger.error('Error creating user profile:', profileError.message || profileError)
          }
          
          // Redirect to onboarding for new users
          return NextResponse.redirect(new URL('/onboarding', requestUrl.origin))
        } else {
          // Existing user, redirect to home or specified next URL
          const redirectUrl = next.startsWith('/') ? next : '/home'
          return NextResponse.redirect(new URL(redirectUrl, requestUrl.origin))
        }
      }
    } catch (error: any) {
      logger.error('Unexpected auth callback error:', error.message || error)
      return NextResponse.redirect(new URL('/auth?error=unexpected_error', requestUrl.origin))
    }
  }

  // No code provided or other error
  return NextResponse.redirect(new URL('/auth?error=no_code', requestUrl.origin))
}
