'use client'

import { useAuth } from '@/lib/auth/AuthHandlerMCP'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Heart, Users, Plus, BarChart3, Settings, LogOut } from 'lucide-react'

export default function HomePage() {
  const { user, profile, loading, signOut, subscriptionStatus, relationshipQuota, hasReachedQuota } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  const handleSignOut = async () => {
    await signOut()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-2 rounded-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">BodyCount</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{subscriptionStatus}</span> plan
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user.email?.split('@')[0]}!
          </h2>
          <p className="text-gray-600">
            Track your relationships and discover insights about your connections.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Relationships</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-xs text-gray-500">
                  {relationshipQuota === Infinity ? 'Unlimited' : `${relationshipQuota} max`}
                </p>
              </div>
              <div className="bg-pink-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-pink-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Insights</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-xs text-gray-500">AI recommendations</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Plan</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">{subscriptionStatus}</p>
                <p className="text-xs text-gray-500">Current subscription</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Settings className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => router.push('/add-relationship')}
            disabled={hasReachedQuota}
            className={`p-6 rounded-xl border-2 border-dashed transition-all text-center ${
              hasReachedQuota
                ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                : 'border-pink-300 text-pink-600 hover:border-pink-400 hover:bg-pink-50'
            }`}
          >
            <Plus className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">
              {hasReachedQuota ? 'Quota Reached' : 'Add Relationship'}
            </p>
            {hasReachedQuota && (
              <p className="text-xs mt-1">Upgrade to add more</p>
            )}
          </button>

          <button
            onClick={() => router.push('/profiles')}
            className="p-6 rounded-xl border-2 border-dashed border-purple-300 text-purple-600 hover:border-purple-400 hover:bg-purple-50 transition-all text-center"
          >
            <Users className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">View Profiles</p>
          </button>

          <button
            onClick={() => router.push('/insights')}
            className="p-6 rounded-xl border-2 border-dashed border-blue-300 text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all text-center"
          >
            <BarChart3 className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">AI Insights</p>
          </button>

          <button
            onClick={() => router.push('/settings')}
            className="p-6 rounded-xl border-2 border-dashed border-green-300 text-green-600 hover:border-green-400 hover:bg-green-50 transition-all text-center"
          >
            <Settings className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">Settings</p>
          </button>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-200">
          <div className="bg-gray-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Heart className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No relationships yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start tracking your relationships to get personalized insights and recommendations.
          </p>
          <button
            onClick={() => router.push('/add-relationship')}
            disabled={hasReachedQuota}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              hasReachedQuota
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700'
            }`}
          >
            {hasReachedQuota ? 'Upgrade to Add More' : 'Add Your First Relationship'}
          </button>
        </div>
      </main>
    </div>
  )
}