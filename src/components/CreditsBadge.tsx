'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/AuthHandlerMCP'
import { createClientComponentClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Coins, Move } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

export default function CreditsBadge() {
  const { user, isLoading } = useAuth()
  const [credits, setCredits] = useState(0)
  const [position, setPosition] = useState({ bottom: 20, right: 20 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const supabase = createClientComponentClient()
  const router = useRouter()
  
  // Verifier si c'est un utilisateur de test
  const isTestUser = typeof document !== 'undefined' && 
    document.cookie.includes('test-user=true')

  useEffect(() => {
    if (user && !isTestUser && !isLoading) {
      fetchCredits()
    }
  }, [user, isTestUser, isLoading])

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

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.right,
      y: e.clientY - position.bottom
    })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return
    
    const newRight = Math.max(20, Math.min(window.innerWidth - 200, e.clientX - dragStart.x))
    const newBottom = Math.max(20, Math.min(window.innerHeight - 100, window.innerHeight - e.clientY - dragStart.y))
    
    setPosition({ right: newRight, bottom: newBottom })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragStart])

  // Ne pas afficher si en cours de chargement, si pas d'utilisateur, ou si utilisateur de test
  if (isLoading || !user || isTestUser) {
    return null
  }

  return (
    <div 
      className={`hidden md:block fixed z-50 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full shadow-lg transition-all duration-300 ${
        isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab hover:from-yellow-600 hover:to-orange-600 hover:scale-105'
      }`}
      style={{
        bottom: `${position.bottom}px`,
        right: `${position.right}px`,
      }}
    >
      {/* Zone de drag */}
      <div 
        className="flex items-center px-2 py-1 rounded-l-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
      >
        <Move className="h-4 w-4 opacity-70" />
      </div>
      
      {/* Zone cliquable pour aller aux crédits */}
      <div 
        className="flex items-center space-x-2 px-3 py-2 cursor-pointer"
        onClick={() => router.push('/credits')}
      >
        <Coins className="h-5 w-5" />
        <span className="font-bold">{credits}</span>
        <span className="text-sm opacity-90">
          <FormattedMessage id="creditsBadge.credits" />
        </span>
      </div>
    </div>
  )
} 