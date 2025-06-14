'use client'

import { useState } from 'react'
import { Filter, Calendar, AlertCircle, ChevronDown } from 'lucide-react'
import { WishlistFilters, PriorityLevel } from '@/lib/supabase/wishlist'
import { getPriorityLabel, getPriorityColor } from '@/lib/supabase/wishlist.helpers'
import { FormattedMessage, useIntl } from 'react-intl'

interface FilterBarProps {
  filters: WishlistFilters
  onFiltersChange: (filters: WishlistFilters) => void
}

export default function FilterBar({ filters, onFiltersChange }: FilterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const intl = useIntl()

  const statusOptions = [
    { value: 'all' as const, labelKey: 'wishlist.filters.all', icon: '✨' },
    { value: 'todo' as const, labelKey: 'wishlist.filters.todo', icon: '⏳' },
    { value: 'completed' as const, labelKey: 'wishlist.filters.completed', icon: '✅' }
  ]

  const priorityOptions: Array<{ value: PriorityLevel; labelKey: string }> = [
    { value: 'high', labelKey: 'wishlist.filters.high' },
    { value: 'medium', labelKey: 'wishlist.filters.medium' },
    { value: 'low', labelKey: 'wishlist.filters.low' }
  ]

  const handleStatusChange = (status: 'all' | 'todo' | 'completed') => {
    onFiltersChange({ ...filters, status })
  }

  const handlePriorityChange = (priority?: PriorityLevel) => {
    onFiltersChange({ ...filters, priority })
  }

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    const dateRange = filters.dateRange || { start: '', end: '' }
    onFiltersChange({
      ...filters,
      dateRange: {
        ...dateRange,
        [field]: value
      }
    })
  }

  const clearDateRange = () => {
    onFiltersChange({ ...filters, dateRange: undefined })
  }

  const hasActiveFilters = filters.priority || filters.dateRange

  return (
    <div className="mb-8">
      <div className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur-lg rounded-2xl border border-white/30 dark:border-white/10 shadow-sm p-6">
        {/* Filtres de statut */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <span className="font-medium text-gray-900 dark:text-white">
              <FormattedMessage id="wishlist.filters.filters" />
            </span>
            {hasActiveFilters && (
              <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 text-xs px-2 py-1 rounded-full">
                <FormattedMessage id="wishlist.filters.active" />
              </span>
            )}
          </div>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <span>
              <FormattedMessage id="wishlist.filters.advancedFilters" />
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Toggle de statut */}
        <div className="flex flex-wrap gap-2 mb-4">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                filters.status === option.value
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <span>{option.icon}</span>
              <span>
                <FormattedMessage id={option.labelKey} />
              </span>
            </button>
          ))}
        </div>

        {/* Filtres avancés */}
        {showAdvanced && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
            {/* Filtre de priorité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FormattedMessage id="wishlist.filters.priority" />
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handlePriorityChange(undefined)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !filters.priority
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <FormattedMessage id="wishlist.filters.all" />
                </button>
                {priorityOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handlePriorityChange(option.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                      filters.priority === option.value
                        ? getPriorityColor(option.value).replace('text-', 'border-').replace('500', '400') + ' ' + getPriorityColor(option.value).replace('text-', 'bg-').replace('500', '50') + ' dark:' + getPriorityColor(option.value).replace('text-', 'bg-').replace('500', '900/30')
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>
                        <FormattedMessage id={option.labelKey} />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Filtre de date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FormattedMessage id="wishlist.filters.targetDate" />
              </label>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    <FormattedMessage id="wishlist.filters.from" />
                  </span>
                  <input
                    type="date"
                    value={filters.dateRange?.start || ''}
                    onChange={(e) => handleDateRangeChange('start', e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    <FormattedMessage id="wishlist.filters.to" />
                  </span>
                  <input
                    type="date"
                    value={filters.dateRange?.end || ''}
                    onChange={(e) => handleDateRangeChange('end', e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                {filters.dateRange && (
                  <button
                    onClick={clearDateRange}
                    className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                  >
                    <FormattedMessage id="wishlist.filters.clear" />
                  </button>
                )}
              </div>
            </div>

            {/* Bouton reset */}
            {hasActiveFilters && (
              <div className="flex justify-end">
                <button
                  onClick={() => onFiltersChange({ status: filters.status })}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                >
                  <FormattedMessage id="wishlist.filters.resetAdvancedFilters" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Résumé des filtres actifs */}
        {hasActiveFilters && (
          <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-orange-800 dark:text-orange-200">
                <span>
                  <FormattedMessage id="wishlist.filters.activeFilters" />
                </span>
                <div className="flex items-center space-x-2">
                  {filters.priority && (
                    <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(filters.priority).replace('text-', 'bg-').replace('500', '100')} ${getPriorityColor(filters.priority)}`}>
                      {getPriorityLabel(filters.priority)}
                    </span>
                  )}
                  {filters.dateRange && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {filters.dateRange.start && filters.dateRange.end
                        ? `${filters.dateRange.start} - ${filters.dateRange.end}`
                        : filters.dateRange.start
                        ? intl.formatMessage({ id: 'wishlist.filters.fromDate' }, { date: filters.dateRange.start })
                        : intl.formatMessage({ id: 'wishlist.filters.toDate' }, { date: filters.dateRange.end })
                      }
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
