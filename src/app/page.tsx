'use client'

import { useAuth } from '@/lib/auth/AuthHandlerMCP'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Heart } from 'lucide-react'

export default function RootPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth')
      } else if (!profile) {
        router.push('/onboarding')
      } else {
        router.push('/home')
      }
    }
  }, [user, profile, loading, router])

  // Show loading spinner while determining redirect
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-4 rounded-full animate-pulse">
            <Heart className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">BodyCount</h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
      </div>
    </div>
  )
}
