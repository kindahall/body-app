'use client'

import { WishlistStats } from '@/lib/supabase/wishlist'
import { getCategoryIcon, getCategoryLabel } from '@/lib/supabase/wishlist.helpers'
import { TrendingUp, Target, CheckCircle, Zap } from 'lucide-react'
import { FormattedMessage, useIntl } from 'react-intl'

interface StatsBarProps {
  stats: WishlistStats
}

export default function StatsBar({ stats }: StatsBarProps) {
  const intl = useIntl()
  
  const categories = [
    { key: 'experience' as const, color: 'from-purple-500 to-indigo-600' },
    { key: 'person' as const, color: 'from-pink-500 to-rose-600' },
    { key: 'place' as const, color: 'from-green-500 to-emerald-600' },
    { key: 'goal' as const, color: 'from-blue-500 to-cyan-600' }
  ]

  return (
    <div className="mb-8">
      {/* Stats globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur-lg rounded-2xl border border-white/30 dark:border-white/10 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                <FormattedMessage id="wishlist.stats.total" />
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <FormattedMessage id="wishlist.stats.wishes" />
              </p>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full">
              <Target className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur-lg rounded-2xl border border-white/30 dark:border-white/10 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                <FormattedMessage id="wishlist.stats.completed" />
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <FormattedMessage id="wishlist.stats.accomplished" />
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur-lg rounded-2xl border border-white/30 dark:border-white/10 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                <FormattedMessage id="wishlist.stats.progress" />
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.completionRate}%</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <FormattedMessage id="wishlist.stats.completedPercent" />
              </p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${stats.completionRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur-lg rounded-2xl border border-white/30 dark:border-white/10 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                <FormattedMessage id="wishlist.stats.streak" />
              </p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.streak}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <FormattedMessage id="wishlist.stats.onFire" /> 🔥
              </p>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full">
              <Zap className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats par catégorie */}
      <div className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur-lg rounded-2xl border border-white/30 dark:border-white/10 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          <FormattedMessage id="wishlist.categoryProgress" />
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            const categoryStats = stats.byCategory[category.key]
            const percentage = categoryStats.total > 0 ? Math.round((categoryStats.completed / categoryStats.total) * 100) : 0
            
            return (
              <div key={category.key} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getCategoryIcon(category.key)}</span>
                    <span className="font-medium text-gray-900 dark:text-white text-sm">
                      {getCategoryLabel(category.key)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {categoryStats.completed}/{categoryStats.total}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`bg-gradient-to-r ${category.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      <FormattedMessage 
                        id="wishlist.completedCount" 
                        values={{ percentage }}
                      />%
                    </span>
                    {categoryStats.total > 0 && (
                      <span>
                        <FormattedMessage 
                          id="wishlist.remaining" 
                          values={{ count: categoryStats.total - categoryStats.completed }}
                        />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Message motivationnel */}
        {stats.total > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
            <div className="flex items-center space-x-2">
              <span className="text-lg">💫</span>
              <div>
                {stats.completionRate === 100 ? (
                  <p className="text-orange-800 dark:text-orange-200 font-medium">
                    <FormattedMessage id="wishlist.motivationalMessages.perfect" />
                  </p>
                ) : stats.completionRate >= 75 ? (
                  <p className="text-orange-800 dark:text-orange-200 font-medium">
                    <FormattedMessage 
                      id="wishlist.motivationalMessages.excellent" 
                      values={{ remaining: stats.total - stats.completed }}
                    />
                  </p>
                ) : stats.completionRate >= 50 ? (
                  <p className="text-orange-800 dark:text-orange-200 font-medium">
                    <FormattedMessage id="wishlist.motivationalMessages.good" />
                  </p>
                ) : stats.completed > 0 ? (
                  <p className="text-orange-800 dark:text-orange-200 font-medium">
                    <FormattedMessage id="wishlist.motivationalMessages.start" />
                  </p>
                ) : (
                  <p className="text-orange-800 dark:text-orange-200 font-medium">
                    <FormattedMessage id="wishlist.motivationalMessages.begin" />
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
