'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Database } from '../supabase'
import { createClientComponentClient } from '@/lib/supabase'

type UserProfile = Database['public']['Tables']['users']['Row']

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  isLoading: boolean
  signInWithEmail: (email: string, password?: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, username?: string) => Promise<{ error: any }>
  resetPassword: (email: string) => Promise<{ error: any }>
  signInWithGoogle: () => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  updateLanguage: (lang: string) => Promise<{ error: any }>
  updateUsername: (username: string) => Promise<{ error: any }>
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
  const [isLoading, setIsLoading] = useState(true)
  const [relationshipCount, setRelationshipCount] = useState(0)
  const router = useRouter()
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => {
          if (typeof document !== 'undefined') {
            const value = document.cookie
              .split('; ')
              .find(row => row.startsWith(`${name}=`))
              ?.split('=')[1]
            return value ? decodeURIComponent(value) : undefined
          }
          return undefined
        },
        set: (name: string, value: string, options: any) => {
          if (typeof document !== 'undefined') {
            const cookieOptions = {
              ...options,
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
              path: '/',
              maxAge: 60 * 60 * 24 * 7 // 7 jours
            }
            
            const cookieString = `${name}=${encodeURIComponent(value)}; ${Object.entries(cookieOptions)
              .map(([key, val]) => `${key}=${val}`)
              .join('; ')}`
            
            document.cookie = cookieString
          }
        },
        remove: (name: string, options: any) => {
          if (typeof document !== 'undefined') {
            document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
          }
        }
      }
    }
  )

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        throw error
      }
      setProfile(data)
      return data
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setProfile(null)
      return null
    }
  }, [supabase])

  const fetchRelationshipCount = useCallback(async (userId: string) => {
    try {
      const { count, error } = await supabase
        .from('relationships')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
      
      if (error) throw error
      setRelationshipCount(count || 0)
    } catch (error) {
      console.error('Error fetching relationship count:', error)
      setRelationshipCount(0)
    }
  }, [supabase])

  // Gérer la visibilité de la page pour maintenir la session
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && user) {
        try {
          const { data: { session }, error } = await supabase.auth.getSession()
          if (error) {
            console.error('Error checking session on visibility change:', error)
            return
          }
          
          if (!session) {
            // Session expirée, déconnecter l'utilisateur
            console.log('Session expired, redirecting to auth...')
            setUser(null)
            setProfile(null)
            setSession(null)
            setRelationshipCount(0)
            router.push('/auth')
          } else if (session.user.id !== user.id) {
            // L'utilisateur a changé, mettre à jour l'état
            setUser(session.user)
            setSession(session)
            await fetchUserProfile(session.user.id)
            await fetchRelationshipCount(session.user.id)
          }
        } catch (error) {
          console.error('Error checking session on visibility change:', error)
        }
      }
    }

    // Vérification périodique de la session (toutes les 30 secondes)
    const sessionCheckInterval = setInterval(async () => {
      if (user) {
        try {
          const { data: { session }, error } = await supabase.auth.getSession()
          if (error || !session) {
            console.log('Session check failed or expired')
            setUser(null)
            setProfile(null)
            setSession(null)
            setRelationshipCount(0)
            router.push('/auth')
          }
        } catch (error) {
          console.error('Error during periodic session check:', error)
        }
      }
    }, 30000) // 30 secondes

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(sessionCheckInterval)
    }
  }, [user, supabase, router, fetchUserProfile, fetchRelationshipCount])

  useEffect(() => {
    let mounted = true

    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!mounted) return
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchUserProfile(session.user.id)
          await fetchRelationshipCount(session.user.id)
        }
        
        setIsLoading(false)
      } catch (error) {
        console.error('Error getting initial session:', error)
        if (mounted) setIsLoading(false)
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        
        console.log('Auth state change:', event, session?.user?.id)
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (event === 'SIGNED_IN' && session?.user) {
          const userProfile = await fetchUserProfile(session.user.id)
          await fetchRelationshipCount(session.user.id)
          
          // Déclencher le bonus quotidien à la connexion
          try {
            await supabase.rpc('smart_daily_bonus')
            console.log('🎁 Bonus quotidien vérifié/accordé')
          } catch (error) {
            console.warn('⚠️ Erreur lors de la vérification du bonus quotidien:', error)
          }
          
          if (!userProfile) {
            router.push('/onboarding')
          } else {
            router.push('/home')
          }
        } else if (event === 'SIGNED_OUT') {
          setProfile(null)
          setRelationshipCount(0)
          router.push('/auth')
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Réactualiser le profil utilisateur après le rafraîchissement du token
          console.log('Token refreshed, updating user profile')
          await fetchUserProfile(session.user.id)
        }
        
        setIsLoading(false)
      }
    )

    // Get initial session only once
    getInitialSession()

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [supabase, router, fetchUserProfile, fetchRelationshipCount])

  const getQuotaForSubscription = (status: string | null | undefined): number => {
    switch (status) {
      case 'free': return 1
      case 'standard': return 10
      case 'premium': return Infinity
      default: return 1
    }
  }

  const subscriptionStatus = (profile?.subscription_status || 'free') as 'free' | 'standard' | 'premium'
  const relationshipQuota = getQuotaForSubscription(subscriptionStatus)
  const hasReachedQuota = relationshipCount >= relationshipQuota

  const signInWithEmail = async (email: string, password?: string) => {
    try {
      // En mode développement, créer une session de test
      if (process.env.NODE_ENV === 'development' && email === 'test@example.com') {
        // Définir le cookie de test
        document.cookie = 'test-user=true; path=/; max-age=86400'
        
        // Simuler une connexion réussie pour les tests
        const mockUser = {
          id: 'test-user-id',
          email: 'test@example.com',
          created_at: new Date().toISOString(),
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          role: 'authenticated'
        } as any
        
        // Créer le profil utilisateur de test
        const { error: profileError } = await supabase
          .from('users')
          .upsert({
            id: mockUser.id,
            email: mockUser.email,
            lang: 'en',
            subscription_status: 'free'
          })
        
        if (profileError) {
          console.error("Failed to create test user profile:", profileError.message || profileError)
        }
        
        if (!profileError) {
          // Simuler l'état d'authentification
          setUser(mockUser)
          setProfile({
            id: mockUser.id,
            email: mockUser.email,
            username: null,
            lang: 'en',
            subscription_status: 'free',
            stripe_customer_id: null,
            stripe_price_id: null,
            created_at: new Date().toISOString()
          })
          
          // Laisser le onAuthStateChange gérer la redirection
          return { error: null }
        }
        
        return { error: profileError }
      }
      
      // Use password authentication if password is provided, otherwise use OTP
      if (password) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        return { error }
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        })
        return { error }
      }
    } catch (error) {
      return { error }
    }
  }

  const signUp = async (email: string, password: string, username?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            username: username
          }
        }
      })
      
      // Si l'inscription réussit et qu'on a un username, créer le profil avec le username
      if (!error && data.user && username) {
        const { error: profileError } = await supabase
          .from('users')
          .upsert({
            id: data.user.id,
            email: data.user.email!,
            username: username,
            lang: 'en',
            subscription_status: 'free'
          })
        
        if (profileError) {
          console.error('Error creating profile with username:', profileError)
        }
      }
      
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
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

  const updateUsername = async (username: string) => {
    if (!user) return { error: 'No user logged in' }
    
    try {
      // Vérifier si le username est déjà pris
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .neq('id', user.id)
        .single()
      
      if (checkError && checkError.code !== 'PGRST116') {
        return { error: checkError }
      }
      
      if (existingUser) {
        return { error: { message: 'Ce pseudo est déjà utilisé' } }
      }
      
      const { error } = await supabase
        .from('users')
        .update({ username })
        .eq('id', user.id)
      
      if (!error) {
        setProfile(prev => prev ? { ...prev, username } : null)
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
    isLoading,
    signInWithEmail,
    signUp,
    resetPassword,
    signInWithGoogle,
    signOut,
    updateLanguage,
    updateUsername,
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
  const { data: existingProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (existingProfile) {
    return { data: existingProfile, error: null }
  }

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
