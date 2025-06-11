'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthHandlerMCP'
import { createClientComponentClient } from '@/lib/supabase'
import { FormattedMessage } from 'react-intl'
import { useTranslatedNavigation } from '@/hooks/useTranslatedNavigation'
import LanguageSelector from '@/components/LanguageSelector'
import { 
  User,
  Menu,
  X,
  Coins
} from 'lucide-react'

export default function MobileNavigation() {
  const router = useRouter()
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [credits, setCredits] = useState(0)
  const supabase = createClientComponentClient()
  const { navigationItems, analysisItems } = useTranslatedNavigation()
  
  // Verifier si c'est un utilisateur de test
  const isTestUser = typeof document !== 'undefined' && 
    document.cookie.includes('test-user=true')

  const displayUser = user || { email: 'test@example.com' }
  const userName = displayUser.email?.split('@')[0] || 'bob dilan'

  // Fetch user credits
  useEffect(() => {
    if (user && !isTestUser) {
      fetchCredits()
    }
  }, [user, isTestUser])

  const fetchCredits = async () => {
    if (!user) return
    
    const { data } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single()
    
    if (data) {
      setCredits(data.credits || 0)
    }
  }

  // Gestion du scroll du body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Gestion de la touche Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  const handleNavigation = (path: string) => {
    router.push(path)
    setIsOpen(false)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false)
    }
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 bg-white rounded-full p-3 shadow-lg border border-gray-200"
        aria-label="Open navigation"
      >
        <Menu className="h-6 w-6 text-gray-700" />
      </button>

      {/* Side Drawer Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/20"
          onClick={handleOverlayClick}
        >
          {/* Side Drawer */}
          <div 
            className={`
              fixed inset-y-0 left-0 z-40 
              w-64 sm:w-72 
              bg-white/20 dark:bg-black/20 
              backdrop-blur-md 
              border-r border-white/30 dark:border-black/30
              transform transition-transform duration-300 ease-in-out
              ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-4 text-white">
              <div className="flex justify-between items-center mb-2">
                <h1 className="text-lg font-bold">BodyCount</h1>
                <button
                  onClick={handleClose}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  aria-label="Close navigation"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm">{userName}</p>
                {user && !isTestUser && (
                  <div 
                    className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-2 cursor-pointer hover:bg-white/30 transition-colors"
                    onClick={() => handleNavigation('/credits')}
                  >
                    <Coins className="h-4 w-4" />
                    <span className="text-sm font-medium">{credits}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Items */}
            <div className="p-4 overflow-y-auto h-full">
              <div className="space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item.path)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/20 dark:hover:bg-black/20 transition-colors text-left"
                    >
                      <Icon className="h-5 w-5 text-gray-900 dark:text-white" />
                      <span className="text-base font-medium md:text-sm text-gray-900 dark:text-white">
                        {item.label}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Nouvelles fonctions */}
              <div className="mt-6 pt-4 border-t border-white/30 dark:border-black/30">
                <div className="space-y-1">
                  {analysisItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigation(item.path)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/20 dark:hover:bg-black/20 transition-colors text-left"
                      >
                        <Icon className="h-5 w-5 text-gray-900 dark:text-white" />
                        <span className="text-base font-medium md:text-sm text-gray-900 dark:text-white">
                          {item.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Language Selector */}
              <div className="mt-6 pt-4 border-t border-white/30 dark:border-black/30">
                <div className="px-3">
                  <LanguageSelector />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
