'use client'

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { Trophy, Plus, Download, ChevronRight, ArrowLeft } from 'lucide-react'
import Confetti from 'react-confetti'
// Removed react-use dependency
import Link from 'next/link'
import { FormattedMessage, useIntl } from 'react-intl'

import { useAuth } from '@/lib/auth/AuthHandlerMCP'
import { WishlistService } from '@/lib/supabase/wishlist'
import type { WishlistStats, WishlistItem, WishlistCategory, WishlistFilters } from '@/lib/supabase/wishlist'
import { getCategoryIcon, getCategoryLabel } from '@/lib/supabase/wishlist.helpers'

import ItemCard from './ItemCard'
import StatsBar from './StatsBar'
import AddEditModal from './AddEditModal'
import FilterBar from './FilterBar'
import ShareDrawer from './ShareDrawer'
import { toast } from 'react-hot-toast'
import { useWishlistItems, useWishlistStats } from '@/hooks/useWishlist'
import { WishlistPageSkeleton } from './WishlistPageSkeleton'

const initialStats: WishlistStats = {
  total: 0,
  completed: 0,
  byCategory: {
    experience: { total: 0, completed: 0 },
    person: { total: 0, completed: 0 },
    place: { total: 0, completed: 0 },
    goal: { total: 0, completed: 0 }
  },
  completionRate: 0,
  streak: 0
}

export default function WishlistPage() {
  const { user } = useAuth()
  const intl = useIntl()
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 })

  useEffect(() => {
    const updateSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])
  
  const [filters, setFilters] = useState<WishlistFilters>({ status: 'all' })
  const [activeCategory, setActiveCategory] = useState<WishlistCategory | 'all'>('all')
  const [isModalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null)
  const [isShareDrawerOpen, setShareDrawerOpen] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const { items: wishlistItems, isLoading: isLoadingItems, addItem, updateItem, deleteItem } = useWishlistItems()
  const { stats: wishlistStats, isLoading: isLoadingStats, mutate: mutateStats } = useWishlistStats()
  
  const categories = useMemo(() => [
     { id: 'all' as const, labelKey: 'wishlist.categories.all', icon: '✨' },
     { id: 'experience' as const, labelKey: 'wishlist.categories.experience', icon: '🌟' },
     { id: 'person' as const, labelKey: 'wishlist.categories.person', icon: '👤' },
     { id: 'place' as const, labelKey: 'wishlist.categories.place', icon: '📍' },
     { id: 'goal' as const, labelKey: 'wishlist.categories.goal', icon: '🎯' }
  ], [])

  const handleAddClick = () => {
    setEditingItem(null)
    setModalOpen(true)
  }

  const handleEditClick = (item: WishlistItem) => {
    setEditingItem(item)
    setModalOpen(true)
  }

  const handleDeleteClick = (item: WishlistItem) => {
    toast((t) => (
      <div className="flex flex-col items-center">
        <span className="text-center">
          <FormattedMessage 
            id="wishlist.toast.deleteConfirm" 
            values={{ title: <b>{item.title}</b> }}
          />
        </span>
        <div className="mt-4 flex gap-2">
          <button
            className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-md"
            onClick={async () => {
              toast.dismiss(t.id)
              await deleteItem(item.id)
              toast.success(intl.formatMessage({ id: 'wishlist.toast.deleted' }))
              mutateStats()
            }}
          >
            <FormattedMessage id="wishlist.toast.delete" />
          </button>
          <button
            className="px-4 py-2 text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
            onClick={() => toast.dismiss(t.id)}
          >
            <FormattedMessage id="wishlist.toast.cancel" />
          </button>
        </div>
      </div>
    ), { duration: 6000 })
  }

  const handleSave = async (itemData: Partial<WishlistItem>) => {
    try {
      if (editingItem) {
        await updateItem({ id: editingItem.id, item: itemData })
        toast.success(intl.formatMessage({ id: 'wishlist.toast.updated' }))
      } else {
        await addItem(itemData)
        toast.success(intl.formatMessage({ id: 'wishlist.toast.added' }))
      }
      setModalOpen(false)
      setEditingItem(null)
      mutateStats()
    } catch (error: any) {
      toast.error(error.message || intl.formatMessage({ id: 'wishlist.toast.unexpectedError' }))
    }
  }
  
  const handleToggleCompleted = async (item: WishlistItem) => {
    try {
      await updateItem({ id: item.id, item: { is_completed: !item.is_completed, completed_at: !item.is_completed ? new Date().toISOString() : undefined } })
      mutateStats()

      if (!item.is_completed) {
        toast.success(intl.formatMessage({ id: 'wishlist.toast.goalAchieved' }))
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 4000)
      } else {
        toast.success(intl.formatMessage({ id: 'wishlist.toast.statusUpdated' }))
      }
    } catch (error: any) {
      toast.error(error.message || intl.formatMessage({ id: 'wishlist.toast.updateError' }))
    }
  }

  const filteredItems = useMemo(() => {
    return wishlistItems?.filter(item => {
      const statusMatch = filters.status === 'all' || (filters.status === 'completed' && item.is_completed) || (filters.status === 'todo' && !item.is_completed)
      const categoryMatch = activeCategory === 'all' || item.category === activeCategory
      return statusMatch && categoryMatch
    }) || []
  }, [wishlistItems, filters, activeCategory])
  
  const exportToPDF = () => {
     const content = `${intl.formatMessage({ id: 'wishlist.exportData.title' })}\n====================\n\n` +
       categories.slice(1).map(cat => {
         const catItems = filteredItems.filter(i => i.category === cat.id);
         if (catItems.length === 0) return '';
         return `${getCategoryIcon(cat.id as WishlistCategory)} ${getCategoryLabel(cat.id as WishlistCategory).toUpperCase()}\n--------------------\n` +
           catItems.map(item => `${item.is_completed ? '✅' : '⏳'} ${item.title}`).join('\n') + '\n'
       }).join('\n');

     const blob = new Blob([content], { type: 'text/plain' });
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = intl.formatMessage({ id: 'wishlist.exportData.filename' });
     a.click();
     URL.revokeObjectURL(url);
   };

  if (isLoadingItems || isLoadingStats) {
    return <WishlistPageSkeleton />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-rose-50 to-sky-50 dark:from-[#120705] dark:via-[#0d0700] dark:to-[#030303]">
      {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} />}
      <header className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur-lg shadow-sm border-b border-white/30 dark:border-white/10 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Link 
                href="/home" 
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title={intl.formatMessage({ id: 'wishlist.backToHome' })}
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                <FormattedMessage id="wishlist.title" />
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              {(wishlistStats?.streak ?? 0) > 0 && (
                <div className="flex items-center space-x-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 px-3 py-1 rounded-full text-sm font-medium">
                  <Trophy className="h-4 w-4" />
                  <span>{wishlistStats?.streak} 🔥</span>
                </div>
              )}
              <button onClick={() => setShareDrawerOpen(true)} className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors" title={intl.formatMessage({ id: 'wishlist.share' })}>
                <ChevronRight className="h-5 w-5" />
              </button>
              <button onClick={exportToPDF} className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors" title={intl.formatMessage({ id: 'wishlist.export' })}>
                <Download className="h-5 w-5" />
              </button>
              <button onClick={handleAddClick} className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                <Plus className="h-5 w-5" />
                <span><FormattedMessage id="wishlist.addWish" /></span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsBar stats={wishlistStats || initialStats} />
        
        <div className="mb-6 overflow-x-auto">
          <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeCategory === category.id
                    ? 'border-b-2 border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-b-2 border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <span>{category.icon}</span>
                <span><FormattedMessage id={category.labelKey} /></span>
                {category.id !== 'all' && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeCategory === category.id
                      ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    {wishlistStats?.byCategory[category.id]?.total || 0}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <FilterBar 
          filters={filters} 
          onFiltersChange={setFilters}
        />

        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-gray-500 mb-4">
              <FormattedMessage id="wishlist.empty.message" />
            </p>
            <button
              onClick={handleAddClick}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
            >
              <FormattedMessage id="wishlist.empty.addFirst" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                onToggleCompleted={() => handleToggleCompleted(item)}
                onEdit={() => handleEditClick(item)}
                onDelete={() => handleDeleteClick(item)}
              />
            ))}
          </div>
        )}
      </main>
      
      {isModalOpen && !editingItem && (
        <AddEditModal
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
      {editingItem && (
        <AddEditModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleSave}
        />
      )}
      {isShareDrawerOpen && (
        <ShareDrawer
          onClose={() => setShareDrawerOpen(false)}
        />
      )}
    </div>
  )
}
