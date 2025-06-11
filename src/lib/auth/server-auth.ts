import { User } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '../supabase'
import { NextRequest } from 'next/server'

// Server-side function to create user profile
export async function createUserProfile(user: User, request: NextRequest, lang: string = 'en') {
  const supabase = createRouteHandlerClient(request)
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id: user.id,
      email: user.email!,
      lang,
      subscription_status: 'free'
    })
    .select()
    .single()
  
  return { data, error }
}