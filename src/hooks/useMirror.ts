import useSWR from 'swr'
import { MirrorService, MirrorData } from '@/lib/supabase/mirror'
import { useAuth } from '@/lib/auth/AuthHandlerMCP'
import { useEffect, useState, useMemo } from 'react'
import { logger } from '@/lib/logger'

const getLocalMirrorData = async (): Promise<MirrorData> => {
  if (typeof window === 'undefined') {
    return MirrorService.initializeDefaultData('local-user')
  }
  
  try {
    const saved = localStorage.getItem('bodycount-mirror-v2')
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    logger.error("Failed to parse local mirror data", e)
  }
  return MirrorService.initializeDefaultData('local-user')
}

const saveLocalMirrorData = (data: MirrorData) => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem('bodycount-mirror-v2', JSON.stringify(data))
  } catch (e) {
    logger.error("Failed to save local mirror data", e)
  }
}

export function useMirror() {
  const { user, isLoading: isAuthLoading } = useAuth()
  // Provide default data immediately for SSR
  const [mirrorData, setMirrorData] = useState<MirrorData | null>(null)
  const [isLoading, setIsLoading] = useState(true) // Start with false since we have default data
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    const loadData = async () => {
      // Wait for auth to load
      if (isAuthLoading) return
      
      try {
        setIsLoading(true)
        let data: MirrorData
        
        if (user) {
          data = await MirrorService.getMirrorData()
        } else {
          data = await getLocalMirrorData()
        }
        
        setMirrorData(data)
        setError(null)
      } catch (err) {
        logger.error('Error loading mirror data:', err)
        setError(err)
        // Provide fallback data even on error
        setMirrorData(MirrorService.initializeDefaultData(user?.id || 'local-user'))
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user, isAuthLoading])

  const saveData = async (newData: MirrorData) => {
    try {
      if (user) {
        await MirrorService.saveMirrorData(newData)
      } else {
        saveLocalMirrorData(newData)
      }
      setMirrorData(newData)
    } catch (err) {
      logger.error('Error saving mirror data:', err)
      throw err
    }
  }

  const memoizedData = useMemo(() => mirrorData, [mirrorData])

  return {
    mirrorData: memoizedData,
    isLoading,
    isError: error,
    saveData,
  }
} 