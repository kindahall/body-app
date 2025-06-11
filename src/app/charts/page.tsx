'use client'

import { useState, useEffect } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useAuth } from '@/lib/auth/AuthHandlerMCP'
import { useRouter } from 'next/navigation'
import { BarChart3, ArrowLeft, TrendingUp, PieChart, Calendar, MapPin, Star, Heart, Users } from 'lucide-react'
import { createClientComponentClient } from '@/lib/supabase'
import { useRelationTypeCounts, useRelationStats, getTypeCount } from '@/hooks/useRelationTypeCounts'
import { logger } from '@/lib/logger'

interface Relationship {
  id: string
  type: 'romantic' | 'sexual' | 'friend' | 'friendzone' | 'other'
  name: string
  start_date: string | null
  location: string | null
  duration: string | null
  feelings: string | null
  rating: number | null
  created_at: string
}

export default function ChartsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const intl = useIntl()
  const supabase = createClientComponentClient()
  
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeChart, setActiveChart] = useState('types')

  // Vérifier si c'est un utilisateur de test
  const isTestUser = typeof document !== 'undefined' && 
    document.cookie.includes('test-user=true')

  // Utiliser les hooks pour obtenir les données centralisées
  const { data: typeCounts = [], isLoading: typeCountsLoading, error: typeCountsError } = useRelationTypeCounts()
  const { data: relationStats, isLoading: statsLoading, error: statsError } = useRelationStats()

  useEffect(() => {
    if (typeCountsError) {
      logger.error('Charts - Error fetching type counts:', typeCountsError)
    }
    if (statsError) {
      logger.error('Charts - Error fetching stats:', statsError)
    }
    if (!typeCountsLoading && !statsLoading) {
      setIsLoading(false)
    }
  }, [typeCounts, relationStats, typeCountsLoading, statsLoading, typeCountsError, statsError])

  useEffect(() => {
    fetchRelationships()
  }, [user, isTestUser])

  const fetchRelationships = async () => {
    if (!user && !isTestUser) return

    setIsLoading(true)
    try {
      if (isTestUser) {
        // Pour les utilisateurs de test, récupérer depuis localStorage
        const testRelations = JSON.parse(localStorage.getItem('test-relations') || '[]')
        setRelationships(testRelations)
      } else {
        const userId = user?.id
        if (!userId) {
          setIsLoading(false)
          return
        }
        
        const { data, error } = await supabase.from('relationships').select('*')
        if (error) {
          console.error('Error fetching relationships:', error.message || error)
          return
        }
        setRelationships(data || [])
      }
    } catch (error: any) {
      console.error('Unexpected error fetching relationships:', error.message || error)
    } finally {
      setIsLoading(false)
    }
  }

  // Les stats sont maintenant directement issues des hooks
  const typeStats = {
    romantic: getTypeCount(typeCounts, 'romantic'),
    sexual: getTypeCount(typeCounts, 'sexual'),
    friend: getTypeCount(typeCounts, 'friend'),
    friendzone: getTypeCount(typeCounts, 'friendzone'),
    other: getTypeCount(typeCounts, 'other')
  }

  const ratingStats = relationships
    .filter(r => r.rating)
    .reduce((acc, r) => {
      const rating = Math.floor(r.rating!)
      acc[rating] = (acc[rating] || 0) + 1
      return acc
    }, {} as Record<number, number>)

  const monthlyStats = relationships.reduce((acc, r) => {
    const month = new Date(r.created_at).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const locationStats = relationships
    .filter(r => r.location)
    .reduce((acc, r) => {
      const location = r.location!
      acc[location] = (acc[location] || 0) + 1
      return acc
    }, {} as Record<string, number>)

  // Calculs avancés pour les nouveaux graphiques
  const averageRating = relationStats?.avg_rating || 0
  const totalRelationships = relationStats?.total_relations || 0
  const medianRating = relationStats?.median_rating || 0 // Supposant que le hook peut le fournir

  // Timeline avec types de relations
  const timelineData = relationships
    .filter(r => r.start_date)
    .map(r => ({
      date: r.start_date!,
      type: r.type,
      name: r.name,
      rating: r.rating
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Corrélation type vs note moyenne
  const correlationData = Object.entries(typeStats).map(([type, count]) => {
    const typeRelations = relationships.filter(r => r.type === type && r.rating)
    const avgRating = typeRelations.length > 0 
      ? typeRelations.reduce((sum, r) => sum + (r.rating || 0), 0) / typeRelations.length
      : 0
    return { type, count, avgRating }
  })

  // Préférences comportementales (radar chart data)
  const preferencesData = {
    notesMoyennes: averageRating / 10, // Normalisé sur 1
    diversiteLieux: Math.min((relationStats?.unique_locations || 0) / 10, 1),
    frequenceRelations: Math.min(totalRelationships / 20, 1),
    satisfactionGlobale: averageRating > 7 ? 1 : averageRating > 5 ? 0.7 : 0.4,
    varietyTypes: Object.values(typeStats).filter(count => count > 0).length / 5 // 5 types max
  }

  // Translation arrays for dynamic content
  const relationshipTypes = [
    { key: 'romantic', id: 'charts.types.romantic' },
    { key: 'sexual', id: 'charts.types.sexual' },
    { key: 'friend', id: 'charts.types.friend' },
    { key: 'friendzone', id: 'charts.types.friendzone' },
    { key: 'other', id: 'charts.types.other' }
  ]

  const getTypeLabel = (type: string) => {
    const typeObj = relationshipTypes.find(t => t.key === type)
    return typeObj ? intl.formatMessage({ id: typeObj.id }) : intl.formatMessage({ id: 'charts.types.other' })
  }

  const charts = [
    { id: 'types', labelId: 'charts.navigation.types', icon: PieChart },
    { id: 'ratings', labelId: 'charts.navigation.ratings', icon: Star },
    { id: 'timeline', labelId: 'charts.navigation.timeline', icon: Calendar },
    { id: 'locations', labelId: 'charts.navigation.locations', icon: MapPin },
    { id: 'preferences', labelId: 'charts.navigation.preferences', icon: TrendingUp },
    { id: 'correlation', labelId: 'charts.navigation.correlation', icon: BarChart3 }
  ]

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'romantic': return { 
        bg: 'bg-pink-500', 
        text: 'text-pink-600', 
        light: 'bg-pink-100',
        hex: '#ec4899' // pink-500
      }
      case 'sexual': return { 
        bg: 'bg-purple-500', 
        text: 'text-purple-600', 
        light: 'bg-purple-100',
        hex: '#a855f7' // purple-500
      }
      case 'friend': return { 
        bg: 'bg-blue-500', 
        text: 'text-blue-600', 
        light: 'bg-blue-100',
        hex: '#3b82f6' // blue-500
      }
      case 'friendzone': return { 
        bg: 'bg-orange-500', 
        text: 'text-orange-600', 
        light: 'bg-orange-100',
        hex: '#f97316' // orange-500
      }
      case 'other': return { 
        bg: 'bg-gray-500', 
        text: 'text-gray-600', 
        light: 'bg-gray-100',
        hex: '#6b7280' // gray-500
      }
      default: return { 
        bg: 'bg-gray-500', 
        text: 'text-gray-600', 
        light: 'bg-gray-100',
        hex: '#6b7280' // gray-500
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => router.push('/home')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mr-6"
            >
              <ArrowLeft className="h-5 w-5" />
              <span><FormattedMessage id="charts.back" /></span>
            </button>
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-2 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                <FormattedMessage id="charts.title" />
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          </div>
        )}

        {!isLoading && (
          <>
            {/* Chart Navigation */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                {charts.map((chart) => {
                  const Icon = chart.icon
                  return (
                    <button
                      key={chart.id}
                      onClick={() => setActiveChart(chart.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        activeChart === chart.id
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span><FormattedMessage id={chart.labelId} /></span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      <FormattedMessage id="charts.stats.totalRelations" />
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{totalRelationships}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      <FormattedMessage id="charts.stats.averageRating" />
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      <FormattedMessage id="charts.stats.medianRating" />
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{medianRating > 0 ? medianRating : 'N/A'}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      <FormattedMessage id="charts.stats.dominantType" />
                    </p>
                    <p className="text-2xl font-bold text-gray-900 capitalize">
                      {Object.keys(typeStats).reduce((a, b) => (typeStats as Record<string, number>)[a] > (typeStats as Record<string, number>)[b] ? a : b, 'N/A')}
                    </p>
                  </div>
                  <div className="bg-pink-100 p-3 rounded-full">
                    <Heart className="h-6 w-6 text-pink-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      <FormattedMessage id="charts.stats.uniqueLocations" />
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{Object.keys(locationStats).length}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <MapPin className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              {/* Types Chart */}
              {activeChart === 'types' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 col-span-1 md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    <FormattedMessage id="charts.types.title" />
                  </h3>
                  {totalRelationships > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                      {/* Pie Chart */}
                      <div className="relative w-full h-64">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          {(() => {
                            const total = Object.values(typeStats).reduce((sum, val) => sum + val, 0);
                            if (total === 0) return <circle cx="50" cy="50" r="40" fill="#f3f4f6" />;
                            
                            let accumulatedPercentage = 0;
                            const elements: React.ReactElement[] = [];
                            
                            Object.entries(typeStats).forEach(([type, count]) => {
                              const percentage = (count / total) * 100;
                              if (count === 0) return; // Skip empty sections
                              
                              const startAngle = (accumulatedPercentage / 100) * 360;
                              const endAngle = ((accumulatedPercentage + percentage) / 100) * 360;
                              
                              const startX = 50 + 40 * Math.cos(startAngle * Math.PI / 180);
                              const startY = 50 + 40 * Math.sin(startAngle * Math.PI / 180);
                              const endX = 50 + 40 * Math.cos(endAngle * Math.PI / 180);
                              const endY = 50 + 40 * Math.sin(endAngle * Math.PI / 180);
                              const largeArcFlag = percentage > 50 ? 1 : 0;
                              
                              // Calculate middle angle for percentage text position
                              const middleAngle = (startAngle + endAngle) / 2;
                              const textRadius = 25; // Closer to center for better readability
                              const textX = 50 + textRadius * Math.cos(middleAngle * Math.PI / 180);
                              const textY = 50 + textRadius * Math.sin(middleAngle * Math.PI / 180);
                              
                              accumulatedPercentage += percentage;

                              // Add path
                              elements.push(
                                <path
                                  key={type}
                                  d={`M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                                  fill={getTypeColor(type).hex}
                                  stroke="#ffffff"
                                  strokeWidth="0.5"
                                />
                              );
                              
                              // Add percentage text (only if percentage is significant enough)
                              if (percentage >= 5) {
                                elements.push(
                                  <text
                                    key={`${type}-text`}
                                    x={textX}
                                    y={textY}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fontSize="4"
                                    fill="white"
                                    fontWeight="bold"
                                    className="drop-shadow-sm"
                                  >
                                    {Math.round(percentage)}%
                                  </text>
                                );
                              }
                            });
                            
                            return elements;
                          })()}
                        </svg>
                      </div>
                      
                      {/* Legend and Stats */}
                      <div className="space-y-4">
                        {Object.entries(typeStats).map(([type, count]) => {
                          if (count === 0) return null
                          const colors = getTypeColor(type)
                          const percentage = totalRelationships > 0 ? ((count / totalRelationships) * 100) : 0
                          return (
                            <div key={type} className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className={`w-4 h-4 rounded-full ${colors.bg}`}></div>
                                <span className="font-medium text-gray-700 capitalize">{getTypeLabel(type)}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-gray-900">{count}</span>
                                <span className="text-sm text-gray-500 ml-1">({percentage.toFixed(1)}%)</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <PieChart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        <FormattedMessage id="charts.emptyState.noData" />
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        <FormattedMessage id="charts.emptyState.addRelations" />
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Enhanced Ratings Chart */}
              {activeChart === 'ratings' && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    <FormattedMessage id="charts.ratings.histogramTitle" />
                  </h3>
                  {Object.keys(ratingStats).length > 0 ? (
                    <div className="space-y-6">
                      {/* Statistiques de notation */}
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">
                          <FormattedMessage id="charts.ratings.analysisTitle" />
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="bg-white rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-yellow-600">{averageRating.toFixed(1)}</div>
                            <div className="text-sm text-gray-600">
                              <FormattedMessage id="charts.ratings.average" />
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-orange-600">{medianRating}</div>
                            <div className="text-sm text-gray-600">
                              <FormattedMessage id="charts.ratings.median" />
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">{Object.values(ratingStats).reduce((sum, c) => sum + c, 0)}</div>
                            <div className="text-sm text-gray-600">
                              <FormattedMessage id="charts.ratings.ratedRelations" />
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {averageRating > 7 ? '😊' : averageRating > 5 ? '😐' : '😔'}
                            </div>
                            <div className="text-sm text-gray-600">
                              {averageRating > 7 ? intl.formatMessage({ id: 'charts.ratings.generous' }) : 
                               averageRating > 5 ? intl.formatMessage({ id: 'charts.ratings.balanced' }) : 
                               intl.formatMessage({ id: 'charts.ratings.strict' })}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Histogramme amélioré */}
                      <div className="space-y-4">
                        {Array.from({ length: 10 }, (_, i) => i + 1).map(rating => {
                          const count = ratingStats[rating] || 0
                          const maxCount = Math.max(...Object.values(ratingStats), 1)
                          const percentage = (count / maxCount) * 100
                          const totalRated = Object.values(ratingStats).reduce((sum, c) => sum + c, 0)
                          const frequencyPercentage = totalRated > 0 ? (count / totalRated) * 100 : 0
                          
                          return (
                            <div key={rating} className="flex items-center space-x-4 relative">
                              <div className="w-8 text-right">
                                <span className="text-sm font-medium text-gray-700">{rating}</span>
                              </div>
                              <div className="flex-1 relative">
                                <div className="w-full bg-gray-200 rounded-full h-8">
                                  <div 
                                    className={`h-8 rounded-full transition-all duration-500 flex items-center justify-between px-3 ${
                                      rating <= 3 ? 'bg-gradient-to-r from-red-400 to-red-600' :
                                      rating <= 6 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                                      rating <= 8 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                                      'bg-gradient-to-r from-green-400 to-green-600'
                                    }`}
                                    style={{ width: `${percentage}%` }}
                                  >
                                    {count > 0 && (
                                      <>
                                        <span className="text-xs font-medium text-white">
                                          {count} <FormattedMessage id="charts.ratings.times" />
                                        </span>
                                        <span className="text-xs font-medium text-white">{frequencyPercentage.toFixed(1)}%</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                {/* Indicateurs moyenne et médiane */}
                                {Math.round(averageRating) === rating && (
                                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                                    <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                                      <FormattedMessage id="charts.ratings.average" />
                                    </div>
                                  </div>
                                )}
                                {medianRating === rating && (
                                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                                    <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded">
                                      <FormattedMessage id="charts.ratings.median" />
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="w-16 text-left">
                                <span className="text-xs">
                                  {rating <= 3 ? '😞' : rating <= 6 ? '😐' : rating <= 8 ? '😊' : '🤩'}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Insights sur les habitudes de notation */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">
                          <FormattedMessage id="charts.ratings.insightsTitle" />
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white rounded-lg p-4">
                            <h5 className="font-medium text-gray-800 mb-2">
                              <FormattedMessage id="charts.ratings.generalTrend" />
                            </h5>
                            <p className="text-sm text-gray-600">
                              <FormattedMessage 
                                id={averageRating > 7 ? 'charts.ratings.generousTrend' : 
                                    averageRating > 5 ? 'charts.ratings.balancedTrend' : 
                                    'charts.ratings.strictTrend'} 
                              />
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-4">
                            <h5 className="font-medium text-gray-800 mb-2">
                              <FormattedMessage id="charts.ratings.mostFrequentRating" />
                            </h5>
                            <p className="text-sm text-gray-600">
                              <FormattedMessage id="charts.ratings.mostFrequentText" />{' '}
                              <span className="font-bold text-blue-600">
                                {Object.entries(ratingStats).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}/10
                              </span>
                              {' '}({Object.entries(ratingStats).sort(([,a], [,b]) => b - a)[0]?.[1] || 0} <FormattedMessage id="charts.ratings.times" />)
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        <FormattedMessage id="charts.ratings.noRatingsEmpty" />
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        <FormattedMessage id="charts.ratings.addRatingsEmpty" />
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Enhanced Timeline Chart */}
              {activeChart === 'timeline' && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    <FormattedMessage id="charts.timeline.interactiveTitle" />
                  </h3>
                  {timelineData.length > 0 ? (
                    <div className="space-y-6">
                      {/* Timeline visuelle */}
                      <div className="relative">
                        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                        <div className="space-y-6">
                          {timelineData.map((item, index) => {
                            const colors = getTypeColor(item.type)
                            return (
                              <div key={index} className="relative flex items-center space-x-4">
                                <div className={`w-4 h-4 rounded-full ${colors.bg} border-4 border-white shadow-lg z-10`}></div>
                                <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h4 className="font-semibold text-gray-900">{item.name}</h4>
                                      <p className="text-sm text-gray-600">{getTypeLabel(item.type)}</p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {new Date(item.date).toLocaleDateString('fr-FR', {
                                          weekday: 'long',
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric'
                                        })}
                                      </p>
                                    </div>
                                    {item.rating && (
                                      <div className="flex items-center space-x-1">
                                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                        <span className="text-sm font-medium">{item.rating}/10</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Analyse temporelle */}
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">
                          <FormattedMessage id="charts.timeline.temporalAnalysis" />
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white rounded-lg p-4">
                            <h5 className="font-medium text-gray-800 mb-2">
                              <FormattedMessage id="charts.timeline.mostActivePeriod" />
                            </h5>
                            <p className="text-sm text-gray-600">
                              {Object.entries(monthlyStats).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
                              {' '}({Object.entries(monthlyStats).sort(([,a], [,b]) => b - a)[0]?.[1] || 0} <FormattedMessage id="charts.timeline.relations" />)
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-4">
                            <h5 className="font-medium text-gray-800 mb-2">
                              <FormattedMessage id="charts.timeline.averageFrequencyAnalysis" />
                            </h5>
                            <p className="text-sm text-gray-600">
                              {timelineData.length > 1 
                                ? `${(timelineData.length / Math.max(Object.keys(monthlyStats).length, 1)).toFixed(1)} ${intl.formatMessage({ id: 'charts.timeline.relationsPerMonth' })}`
                                : intl.formatMessage({ id: 'charts.timeline.notEnoughData' })
                              }
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-4">
                            <h5 className="font-medium text-gray-800 mb-2">
                              <FormattedMessage id="charts.timeline.dominantTypeAnalysis" />
                            </h5>
                            <p className="text-sm text-gray-600">
                              {getTypeLabel(Object.entries(typeStats).sort(([,a], [,b]) => b - a)[0]?.[0] || '')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        <FormattedMessage id="charts.timeline.noData" />
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        <FormattedMessage id="charts.timeline.addDates" />
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Enhanced Locations Chart */}
              {activeChart === 'locations' && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    <FormattedMessage id="charts.locations.interactiveTitle" />
                  </h3>
                  {Object.keys(locationStats).length > 0 ? (
                    <div className="space-y-6">
                      {/* Top lieux */}
                      <div className="space-y-4">
                        {Object.entries(locationStats)
                          .sort(([,a], [,b]) => b - a)
                          .slice(0, 10)
                          .map(([location, count], index) => {
                            const maxCount = Math.max(...Object.values(locationStats), 1)
                            const percentage = (count / maxCount) * 100
                            const relationsAtLocation = relationships.filter(r => r.location === location)
                            const avgRating = relationsAtLocation.filter(r => r.rating).length > 0
                              ? relationsAtLocation.filter(r => r.rating).reduce((sum, r) => sum + (r.rating || 0), 0) / relationsAtLocation.filter(r => r.rating).length
                              : 0
                            
                            return (
                              <div key={location} className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                                    }`}>
                                      {index + 1}
                                    </div>
                                    <div>
                                      <h5 className="font-medium text-gray-800">{location}</h5>
                                      <p className="text-sm text-gray-600">
                                        {count} <FormattedMessage id="charts.locations.meetings" />
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    {avgRating > 0 && (
                                      <div className="flex items-center space-x-1 mb-1">
                                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                        <span className="text-sm font-medium">{avgRating.toFixed(1)}/10</span>
                                      </div>
                                    )}
                                    <span className="text-xs text-gray-500">
                                      {percentage.toFixed(1)}<FormattedMessage id="charts.locations.ofTotal" />
                                    </span>
                                  </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                  <div 
                                    className="h-3 rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        <FormattedMessage id="charts.locations.noLocations" />
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Preferences Chart - Radar/Spider Chart */}
              {activeChart === 'preferences' && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    <FormattedMessage id="charts.preferences.spiderTitle" />
                  </h3>
                  {totalRelationships > 0 ? (
                    <div className="space-y-8">
                      {/* Radar Chart Simulation */}
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">
                          <FormattedMessage id="charts.preferences.analysis" />
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {[
                            { label: intl.formatMessage({ id: 'charts.preferences.averageRatings' }), value: preferencesData.notesMoyennes, color: 'yellow' },
                            { label: intl.formatMessage({ id: 'charts.preferences.locationDiversity' }), value: preferencesData.diversiteLieux, color: 'green' },
                            { label: intl.formatMessage({ id: 'charts.preferences.relationshipFrequency' }), value: preferencesData.frequenceRelations, color: 'blue' },
                            { label: intl.formatMessage({ id: 'charts.preferences.globalSatisfaction' }), value: preferencesData.satisfactionGlobale, color: 'pink' },
                            { label: intl.formatMessage({ id: 'charts.preferences.typeVariety' }), value: preferencesData.varietyTypes, color: 'purple' }
                          ].map((item, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                                <span className="text-sm font-bold text-gray-900">{(item.value * 100).toFixed(0)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-3">
                                <div 
                                  className={`h-3 rounded-full bg-gradient-to-r from-${item.color}-400 to-${item.color}-600 transition-all duration-1000`}
                                  style={{ width: `${item.value * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        <FormattedMessage id="charts.preferences.notEnoughData" />
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Correlation Chart */}
              {activeChart === 'correlation' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 col-span-1 md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    <FormattedMessage id="charts.correlation.correlationTitle" />
                  </h3>
                  {correlationData.filter(d => d.count > 0).length > 0 ? (
                    <div className="h-80 w-full relative">
                      {/* Barres pour le nombre de relations */}
                      <div className="flex h-full items-end justify-around px-4">
                        {correlationData.map(({ type, count }) => {
                          const maxCount = Math.max(...correlationData.map(d => d.count), 1);
                          const barHeight = (count / maxCount) * 100;
                          const colors = getTypeColor(type);
                          return (
                            <div key={type} className="flex flex-col items-center h-full justify-end" style={{ width: '15%'}}>
                              <div
                                className={`${colors.light} rounded-t-lg w-full transition-all duration-500 hover:opacity-80`}
                                style={{ height: `${barHeight}%` }}
                              ></div>
                              <span className="text-xs font-medium mt-2 capitalize">{getTypeLabel(type)}</span>
                            </div>
                          )
                        })}
                      </div>
                      {/* Ligne pour la note moyenne */}
                      <div className="absolute top-0 left-0 w-full h-full">
                        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                          <path
                            d={(() => {
                              const data = correlationData.filter(d => d.count > 0);
                              if (data.length < 2) return '';
                              const maxRating = 10;
                              const points = data.map((d, i) => {
                                // Position X au centre de la barre correspondante
                                const x = (i + 0.5) * (100 / data.length);
                                const y = 100 - (d.avgRating / maxRating) * 100;
                                return `${x},${y}`;
                              });
                              return `M ${points.join(' L ')}`;
                            })()}
                            fill="none"
                            stroke="#fb7185"
                            strokeWidth="2"
                            vectorEffect="non-scaling-stroke"
                          />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <BarChart3 className="h-12 w-12 mx-auto text-gray-300" />
                      <p className="mt-4 text-gray-600">
                        <FormattedMessage id="charts.correlation.notEnoughData" />
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
