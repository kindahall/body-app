'use client'

import { useAuth } from '@/lib/auth/AuthHandlerMCP'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Heart, Users, Plus, BarChart3, Settings, LogOut, MessageCircle, BookOpen, Star } from 'lucide-react'
import { createClientComponentClient } from '@/lib/supabase'
import { Database } from '@/lib/supabase'
import NotificationButton from '@/components/NotificationButton'
import DailyNotificationToast from '@/components/DailyNotificationToast'
import NotificationDemo from '@/components/NotificationDemo'
import LanguageSelector from '@/components/LanguageSelector'
import { FormattedMessage, useIntl } from 'react-intl'

interface Relationship {
  id: string
  type: 'romantic' | 'sexual' | 'friend' | 'other'
  name: string
  rating: number | null
  created_at: string
}

export default function HomePage() {
  const { user, profile, isLoading, signOut } = useAuth()
  const router = useRouter()
  const supabase = createClientComponentClient()
  const intl = useIntl()
  
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [stats, setStats] = useState({
    total: 0,
    averageRating: 0,
    insights: 0
  })
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  
  // Vérifier si c'est un utilisateur de test
  const isTestUser = typeof document !== 'undefined' && 
    document.cookie.includes('test-user=true')

  useEffect(() => {
    if (!isLoading && !user && !isTestUser) {
      router.push('/auth')
    }
  }, [user, isLoading, router, isTestUser])

  useEffect(() => {
    if ((user || isTestUser) && !isLoading) {
      fetchStats()
    }
  }, [user, isTestUser, isLoading])

  const fetchStats = async () => {
    if (!user && !isTestUser) return

    setIsLoadingStats(true)
    try {
      let relationshipsData: Relationship[] = []
      
      if (isTestUser) {
        // Pour les utilisateurs de test, récupérer depuis localStorage
        const testRelations = JSON.parse(localStorage.getItem('test-relations') || '[]')
        relationshipsData = testRelations
      } else {
        // Pour les vrais utilisateurs, récupérer depuis Supabase
        const userId = user?.id
        if (!userId) {
          console.error('No user ID available to fetch stats.')
          setIsLoadingStats(false)
          return
        }
        
        const { data, error } = await supabase
          .from('relationships')
          .select('*')
          .eq('user_id', userId)

        if (error) {
          console.error('Error fetching relationships:', error.message || error)
          // Ne pas afficher d'erreur pour l'instant, juste utiliser un tableau vide
          relationshipsData = []
        } else {
          relationshipsData = data || []
        }
      }
      
      setRelationships(relationshipsData)
      
      // Calculer les statistiques
      const total = relationshipsData.length
      const ratingsData = relationshipsData.filter(r => r.rating)
      const averageRating = ratingsData.length > 0 
        ? ratingsData.reduce((sum, r) => sum + (r.rating || 0), 0) / ratingsData.length
        : 0
      
      // Générer des insights basiques
      let insights = 0
      if (total > 0) insights++
      if (averageRating > 7) insights++
      if (total > 5) insights++
      
      setStats({
        total,
        averageRating: Math.round(averageRating * 10) / 10,
        insights
      })
    } catch (error: any) {
      console.error('Unexpected error fetching stats:', error.message || error)
    }
    setIsLoadingStats(false)
  }

  const handleSignOut = async () => {
    await signOut()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  if (!user && !profile && !isTestUser) {
    return null
  }
  
  // Données par défaut pour l'utilisateur de test
  const displayUser = user || { email: 'test@example.com' }
  const displayProfile = profile || {
    subscription_status: 'free',
    lang: 'en'
  }

  // Fonction pour déterminer le nom d'affichage
  const getDisplayName = () => {
    // Pour les utilisateurs de test, vérifier d'abord le localStorage
    if (isTestUser) {
      const testUsername = localStorage.getItem('test-username')
      if (testUsername) {
        return `@${testUsername}`
      }
    }
    
    // Priorité au pseudo s'il existe dans le profil
    if ((profile as any)?.username) {
      return `@${(profile as any)?.username}`
    }
    
    // Sinon utiliser la partie avant @ de l'email
    if (displayUser.email) {
      return displayUser.email.split('@')[0]
    }
    
    // Fallback
    return 'utilisateur'
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
              <LanguageSelector />
              <NotificationButton />
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
            <FormattedMessage id="homePage.welcome.title" /> <span className={((profile as any)?.username || (isTestUser && localStorage.getItem('test-username'))) ? "text-transparent bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text" : ""}>{getDisplayName()}</span><FormattedMessage id="homePage.welcome.exclamation" />
          </h2>
          <p className="text-gray-600">
            <FormattedMessage id="homePage.welcome.subtitle" />
          </p>
          {!isTestUser && !(profile as any)?.username && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong><FormattedMessage id="homePage.welcome.tipTitle" /></strong> <FormattedMessage id="homePage.welcome.tipText" />{' '}
                <button 
                  onClick={() => router.push('/settings')}
                  className="underline hover:text-blue-800 font-medium"
                >
                  <FormattedMessage id="homePage.welcome.settings" />
                </button>
                <FormattedMessage id="homePage.welcome.exclamation" />
              </p>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  <FormattedMessage id="homePage.stats.relationships.title" />
                </p>
                {isLoadingStats ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-8 rounded"></div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                )}
                <p className="text-xs text-gray-500">
                  <FormattedMessage id="homePage.stats.relationships.subtitle" />
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
                <p className="text-sm font-medium text-gray-600">
                  <FormattedMessage id="homePage.stats.averageRating.title" />
                </p>
                {isLoadingStats ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.averageRating > 0 ? `${stats.averageRating}/10` : 'N/A'}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  <FormattedMessage id="homePage.stats.averageRating.subtitle" />
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <BarChart3 className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  <FormattedMessage id="homePage.stats.insights.title" />
                </p>
                {isLoadingStats ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-8 rounded"></div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">{stats.insights}</p>
                )}
                <p className="text-xs text-gray-500">
                  <FormattedMessage id="homePage.stats.insights.subtitle" />
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => router.push('/add-relationship')}
            className="p-6 rounded-xl border-2 border-dashed border-pink-300 text-pink-600 hover:border-pink-400 hover:bg-pink-50 transition-all text-center"
          >
            <Plus className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">
              <FormattedMessage id="homePage.quickActions.addRelationship" />
            </p>
          </button>

          <button
            onClick={() => router.push('/profiles')}
            className="p-6 rounded-xl border-2 border-dashed border-purple-300 text-purple-600 hover:border-purple-400 hover:bg-purple-50 transition-all text-center"
          >
            <Users className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">
              <FormattedMessage id="homePage.quickActions.viewProfiles" />
            </p>
          </button>

          <button
            onClick={() => router.push('/insights')}
            className="p-6 rounded-xl border-2 border-dashed border-blue-300 text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all text-center"
          >
            <BarChart3 className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">
              <FormattedMessage id="homePage.quickActions.aiInsights" />
            </p>
          </button>

          <button
            onClick={() => router.push('/charts')}
            className="p-6 rounded-xl border-2 border-dashed border-indigo-300 text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 transition-all text-center"
          >
            <BarChart3 className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">
              <FormattedMessage id="homePage.quickActions.charts" />
            </p>
          </button>
        </div>

        {/* Special Features */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            <FormattedMessage id="homePage.specialFeatures.title" />
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Confessions anonymes */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-500 p-3 rounded-full group-hover:scale-110 transition-transform">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                  <FormattedMessage id="homePage.specialFeatures.confessions.badge" />
                </span>
              </div>
              <h4 className="font-bold text-blue-900 mb-2">
                <FormattedMessage id="homePage.specialFeatures.confessions.title" />
              </h4>
              <p className="text-blue-700 text-sm mb-4">
                <FormattedMessage id="homePage.specialFeatures.confessions.description" />
              </p>
              <button 
                onClick={() => router.push('/confessions')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <FormattedMessage id="homePage.specialFeatures.confessions.button" />
              </button>
            </div>

            {/* Journal intime */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl p-6 border border-purple-200 hover:shadow-lg transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-500 p-3 rounded-full group-hover:scale-110 transition-transform">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                  <FormattedMessage id="homePage.specialFeatures.journal.badge" />
                </span>
              </div>
              <h4 className="font-bold text-purple-900 mb-2">
                <FormattedMessage id="homePage.specialFeatures.journal.title" />
              </h4>
              <p className="text-purple-700 text-sm mb-4">
                <FormattedMessage id="homePage.specialFeatures.journal.description" />
              </p>
              <button 
                onClick={() => router.push('/journal')}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                <FormattedMessage id="homePage.specialFeatures.journal.button" />
              </button>
            </div>

            {/* Le miroir */}
            <div className="bg-gradient-to-br from-pink-50 to-rose-100 rounded-xl p-6 border border-pink-200 hover:shadow-lg transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-pink-500 p-3 rounded-full group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full font-medium">
                  <FormattedMessage id="homePage.specialFeatures.mirror.badge" />
                </span>
              </div>
              <h4 className="font-bold text-pink-900 mb-2">
                <FormattedMessage id="homePage.specialFeatures.mirror.title" />
              </h4>
              <p className="text-pink-700 text-sm mb-4">
                <FormattedMessage id="homePage.specialFeatures.mirror.description" />
              </p>
              <button 
                onClick={() => router.push('/mirror')}
                className="w-full bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 transition-colors text-sm font-medium"
              >
                <FormattedMessage id="homePage.specialFeatures.mirror.button" />
              </button>
            </div>

            {/* Wishlist secrète */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl p-6 border border-amber-200 hover:shadow-lg transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-amber-500 p-3 rounded-full group-hover:scale-110 transition-transform">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                  <FormattedMessage id="homePage.specialFeatures.wishlist.badge" />
                </span>
              </div>
              <h4 className="font-bold text-amber-900 mb-2">
                <FormattedMessage id="homePage.specialFeatures.wishlist.title" />
              </h4>
              <p className="text-amber-700 text-sm mb-4">
                <FormattedMessage id="homePage.specialFeatures.wishlist.description" />
              </p>
              <button 
                onClick={() => router.push('/wishlist')}
                className="w-full bg-amber-600 text-white py-2 px-4 rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
              >
                <FormattedMessage id="homePage.specialFeatures.wishlist.button" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation rapide */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            <FormattedMessage id="homePage.quickNavigation.title" />
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/settings')}
              className="p-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all text-left flex items-center space-x-4"
            >
              <div className="bg-gray-100 p-3 rounded-full">
                <Settings className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  <FormattedMessage id="homePage.quickNavigation.settings.title" />
                </p>
                <p className="text-sm text-gray-600">
                  <FormattedMessage id="homePage.quickNavigation.settings.description" />
                </p>
              </div>
            </button>

            <button
              onClick={() => router.push('/insights')}
              className="p-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all text-left flex items-center space-x-4"
            >
              <div className="bg-gray-100 p-3 rounded-full">
                <BarChart3 className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  <FormattedMessage id="homePage.quickNavigation.insights.title" />
                </p>
                <p className="text-sm text-gray-600">
                  <FormattedMessage id="homePage.quickNavigation.insights.description" />
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Content Section */}
        {!isLoadingStats && stats.total === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-200">
            <div className="bg-gray-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              <FormattedMessage id="homePage.emptyState.title" />
            </h3>
            <p className="text-gray-600 mb-6">
              <FormattedMessage id="homePage.emptyState.description" />
            </p>
            <button
              onClick={() => router.push('/add-relationship')}
              className="px-6 py-3 rounded-lg font-medium transition-all bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"
            >
              <FormattedMessage id="homePage.emptyState.button" />
            </button>
          </div>
        ) : (
          /* Recent Activity */
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <FormattedMessage id="homePage.recentActivity.title" />
              </h3>
              {isLoadingStats ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex space-x-4">
                      <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : relationships.length > 0 ? (
                <div className="space-y-4">
                  {relationships.slice(0, 3).map((relationship) => (
                    <div key={relationship.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-2 rounded-full">
                        <Heart className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{relationship.name}</p>
                        <p className="text-sm text-gray-500">
                          <FormattedMessage id="homePage.recentActivity.addedOn" /> {new Date(relationship.created_at).toLocaleDateString(intl.locale === 'fr' ? 'fr-FR' : 'en-US')}
                          {relationship.rating && ` • ${intl.formatMessage({ id: 'homePage.recentActivity.rating' })} ${relationship.rating}/10`}
                        </p>
                      </div>
                    </div>
                  ))}
                  {relationships.length > 3 && (
                    <button
                      onClick={() => router.push('/profiles')}
                      className="w-full text-center py-2 text-pink-600 hover:text-pink-700 font-medium transition-colors"
                    >
                      <FormattedMessage 
                        id="homePage.recentActivity.viewAll" 
                        values={{ count: relationships.length }}
                      /> ({relationships.length})
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  <FormattedMessage id="homePage.recentActivity.noActivity" />
                </p>
              )}
            </div>

            {/* Quick Tips */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <FormattedMessage id="homePage.tips.title" />
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-pink-100 p-2 rounded-full">
                    <Heart className="h-4 w-4 text-pink-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      <FormattedMessage id="homePage.tips.honest.title" />
                    </p>
                    <p className="text-sm text-gray-600">
                      <FormattedMessage id="homePage.tips.honest.description" />
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <BarChart3 className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      <FormattedMessage id="homePage.tips.charts.title" />
                    </p>
                    <p className="text-sm text-gray-600">
                      <FormattedMessage id="homePage.tips.charts.description" />
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Toast de notification quotidienne */}
      <DailyNotificationToast />
      
      {/* Composant de démonstration pour tester les notifications */}
      <NotificationDemo />
    </div>
  )
}
