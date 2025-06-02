'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClientComponentClient } from '../supabase'
import { useRouter } from 'next/navigation'
import { Database } from '../supabase'

type UserProfile = Database['public']['Tables']['users']['Row']

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  signInWithEmail: (email: string) => Promise<{ error: any }>
  signInWithGoogle: () => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  updateLanguage: (lang: string) => Promise<{ error: any }>
  subscriptionStatus: 'free' | 'standard' | 'premium'
  relationshipQuota: number
  hasReachedQuota: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Calculate quota based on subscription status
  const getQuotaForSubscription = (status: string): number => {
    switch (status) {
      case 'free': return 1
      case 'standard': return 10
      case 'premium': return Infinity
      default: return 1
    }
  }

  const subscriptionStatus = (profile?.subscription_status || 'free') as 'free' | 'standard' | 'premium'
  const relationshipQuota = getQuotaForSubscription(subscriptionStatus)

  // Check if user has reached their relationship quota
  const [relationshipCount, setRelationshipCount] = useState(0)
  const hasReachedQuota = relationshipCount >= relationshipQuota

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchUserProfile(session.user.id)
        await fetchRelationshipCount(session.user.id)
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchUserProfile(session.user.id)
          await fetchRelationshipCount(session.user.id)
          
          // Redirect based on profile completeness
          if (event === 'SIGNED_IN') {
            const { data: existingProfile } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single()
            
            if (!existingProfile) {
              router.push('/onboarding')
            } else {
              router.push('/home')
            }
          }
        } else {
          setProfile(null)
          setRelationshipCount(0)
          if (event === 'SIGNED_OUT') {
            router.push('/auth')
          }
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, router])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error)
        return
      }
      
      setProfile(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const fetchRelationshipCount = async (userId: string) => {
    try {
      const { count, error } = await supabase
        .from('relationships')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
      
      if (error) {
        console.error('Error fetching relationship count:', error)
        return
      }
      
      setRelationshipCount(count || 0)
    } catch (error) {
      console.error('Error fetching relationship count:', error)
    }
  }

  const signInWithEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const updateLanguage = async (lang: string) => {
    if (!user) return { error: 'No user logged in' }
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ lang })
        .eq('id', user.id)
      
      if (!error) {
        setProfile(prev => prev ? { ...prev, lang } : null)
      }
      
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signInWithEmail,
    signInWithGoogle,
    signOut,
    updateLanguage,
    subscriptionStatus,
    relationshipQuota,
    hasReachedQuota
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Server-side auth helper
export async function getServerSession() {
  const supabase = createClientComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// Create or update user profile after auth
export async function createUserProfile(user: User, lang: string = 'en') {
  const supabase = createClientComponentClient()
  
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