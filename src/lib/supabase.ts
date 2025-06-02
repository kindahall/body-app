import { createClient } from '@supabase/supabase-js'
import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          lang: string
          subscription_status: 'free' | 'standard' | 'premium'
          stripe_customer_id: string | null
          stripe_price_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          lang?: string
          subscription_status?: 'free' | 'standard' | 'premium'
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          lang?: string
          subscription_status?: 'free' | 'standard' | 'premium'
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          created_at?: string
        }
      }
      relationships: {
        Row: {
          id: string
          user_id: string
          type: 'romantic' | 'sexual' | 'friend' | 'other'
          name: string
          start_date: string | null
          location: string | null
          duration: string | null
          feelings: string | null
          rating: number | null
          private_note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'romantic' | 'sexual' | 'friend' | 'other'
          name: string
          start_date?: string | null
          location?: string | null
          duration?: string | null
          feelings?: string | null
          rating?: number | null
          private_note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'romantic' | 'sexual' | 'friend' | 'other'
          name?: string
          start_date?: string | null
          location?: string | null
          duration?: string | null
          feelings?: string | null
          rating?: number | null
          private_note?: string | null
          created_at?: string
        }
      }
      recommendations: {
        Row: {
          id: string
          user_id: string
          kind: 'partner' | 'place' | 'advice'
          content: any
          generated_by_ai: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          kind: 'partner' | 'place' | 'advice'
          content: any
          generated_by_ai?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          kind?: 'partner' | 'place' | 'advice'
          content?: any
          generated_by_ai?: boolean
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_price_id: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          status: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          status?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client
export const createClientComponentClient = () =>
  createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client for Server Components
export const createServerComponentClient = async () => {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Server-side Supabase client for Route Handlers
export const createRouteHandlerClient = (request: NextRequest) => {
  const response = NextResponse.next()
  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )
}

// Middleware Supabase client
export const createMiddlewareClient = (request: NextRequest) => {
  const response = NextResponse.next()
  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )
}