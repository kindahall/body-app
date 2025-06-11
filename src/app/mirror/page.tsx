'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Users, Eye, TrendingUp, Save, Edit3, Plus, Share2, History, Download, Sparkles, Clock } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthHandlerMCP'
import { createClientComponentClient } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { Skeleton } from '@/components/ui/Skeleton'
import { FormattedMessage, useIntl } from 'react-intl'

import { useMirror } from '@/hooks/useMirror'
import { templates } from '@/lib/supabase/mirror'
import type { MirrorData, ReflectionItem } from '@/lib/supabase/mirror'
import { MirrorPageSkeleton } from './MirrorPageSkeleton'
import { ListEditor } from './ListEditor'

interface HistoryEntry {
  id: string
  type: 'self' | 'others' | 'growth'
  title: string
  items: string[]
  created_at: string
}

export default function MirrorPage() {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClientComponentClient()
  const intl = useIntl()
  
  const { mirrorData, isLoading, isError, saveData } = useMirror()

  const [activeTab, setActiveTab] = useState<'self' | 'others' | 'growth'>('self')
  const [isEditing, setIsEditing] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const [editData, setEditData] = useState<MirrorData | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])

  useEffect(() => {
    if (isEditing && mirrorData) {
      setEditData(JSON.parse(JSON.stringify(mirrorData)))
    } else {
      setEditData(null)
    }
  }, [isEditing, mirrorData])

  const progress = useMemo(() => {
    const data = mirrorData
    if (!data) return 0
    const totalSections = Object.keys(templates).length * 4
    let filledSections = 0
    
    Object.values(data).forEach(sections => {
      if (Array.isArray(sections)) {
        sections.forEach(section => {
          if (section.items && section.items.length > 0) {
            filledSections++
          }
        })
      }
    })
    
    return Math.round((filledSections / totalSections) * 100)
  }, [mirrorData])

  const handleSave = async () => {
    if (!editData) return
    setIsSaving(true)
    try {
      // Create a new object for saving to update the lastUpdated field
      const dataToSave = {
        ...editData,
        lastUpdated: new Date().toISOString()
      }
      await saveData(dataToSave)
      setIsEditing(false)
      toast.success(intl.formatMessage({ id: 'mirror.messages.saveSuccess' }))
    } catch (error: any) {
      toast.error(error.message || intl.formatMessage({ id: 'mirror.messages.saveError' }))
    } finally {
      setIsSaving(false)
    }
  }

  const addItem = (sectionIndex: number, item: string) => {
    if (!item.trim()) return
    setEditData(prev => {
      if (!prev) return null
      const newData = JSON.parse(JSON.stringify(prev))
      const section = newData[activeTab][sectionIndex]
      section.items = [...section.items, item.trim()]
      return newData
    })
  }

  const removeItem = (sectionIndex: number, itemIndex: number) => {
    setEditData(prev => {
      if (!prev) return null
      const newData = JSON.parse(JSON.stringify(prev))
      const section = newData[activeTab][sectionIndex]
      section.items = section.items.filter((_: string, i: number) => i !== itemIndex)
      return newData
    })
  }

  const updateConfidenceLevel = (level: number) => {
    setEditData(prev => {
      if (!prev) return null
      return {
        ...prev,
        confidenceLevel: level,
      }
    })
  }

  const loadHistory = async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('self_reflection')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(20)
    if (error) toast.error(intl.formatMessage({ id: 'mirror.history.loadError' }))
    else setHistory(data || [])
  }

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString(intl.locale, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  const tabs = [
    { id: 'self' as const, label: intl.formatMessage({ id: 'mirror.tabs.self' }), icon: Eye },
    { id: 'others' as const, label: intl.formatMessage({ id: 'mirror.tabs.others' }), icon: Users },
    { id: 'growth' as const, label: intl.formatMessage({ id: 'mirror.tabs.growth' }), icon: TrendingUp }
  ]

  if (isLoading) return <MirrorPageSkeleton />
  if (isError || !mirrorData) return <div><FormattedMessage id="mirror.messages.loadError" /></div>

  const currentData = isEditing && editData ? editData : mirrorData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button onClick={() => router.push('/home')} className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors mr-6">
                <ArrowLeft className="h-5 w-5" />
                <span><FormattedMessage id="mirror.backButton" /></span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-pink-500 to-rose-600 p-2 rounded-lg"><Users className="h-6 w-6 text-white" /></div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white"><FormattedMessage id="mirror.title" /></h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400"><FormattedMessage id="mirror.subtitle" /></p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500 dark:text-gray-400"><Clock className="h-4 w-4 inline mr-1" />{formatDate(mirrorData.lastUpdated)}</span>
              <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} disabled={isSaving} className="flex items-center space-x-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50">
                {isSaving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : isEditing ? <Save className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                <span>{isSaving ? <FormattedMessage id="mirror.buttons.saving" /> : isEditing ? <FormattedMessage id="mirror.buttons.save" /> : <FormattedMessage id="mirror.buttons.edit" />}</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border border-pink-200 dark:border-pink-800 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-pink-900 dark:text-pink-100"><FormattedMessage id="mirror.welcome.title" /></h3>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-pink-200 dark:bg-pink-800 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-pink-500 to-rose-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-sm font-bold text-pink-700 dark:text-pink-300">
                <FormattedMessage 
                  id="mirror.progress.completion" 
                  values={{ percent: progress }}
                />
              </span>
            </div>
          </div>
          <p className="text-pink-700 dark:text-pink-200 text-sm">
            <FormattedMessage id="mirror.welcome.description" />
          </p>
          {progress === 100 && (
            <div className="mt-3 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg">
              <p className="text-green-800 dark:text-green-200 text-sm font-medium">
                <FormattedMessage id="mirror.welcome.completed" />
              </p>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6 overflow-x-auto">
              {tabs.map((tab) => {
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'self' | 'others' | 'growth')}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-pink-500 text-pink-600 dark:text-pink-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="p-6">
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  {activeTab === 'self' && <>👁️ <FormattedMessage id="mirror.content.self.title" /></>}
                  {activeTab === 'others' && <>👥 <FormattedMessage id="mirror.content.others.title" /></>}
                  {activeTab === 'growth' && <>🎯 <FormattedMessage id="mirror.content.growth.title" /></>}
                </h3>
                
                {activeTab === 'growth' && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6 mb-8">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-4">📊 <FormattedMessage id="mirror.content.growth.confidenceTitle" /></h4>
                    <div className="space-y-4">
                      {isEditing && editData ? (
                        <div>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={editData.confidenceLevel}
                            onChange={(e) => updateConfidenceLevel(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
                            <span><FormattedMessage id="mirror.content.growth.confidenceLow" /></span>
                            <span className="font-medium text-lg text-blue-600 dark:text-blue-400">
                              {editData.confidenceLevel}/10
                            </span>
                            <span><FormattedMessage id="mirror.content.growth.confidenceHigh" /></span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-4">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                            <div 
                              className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full transition-all duration-300"
                              style={{ width: `${(mirrorData.confidenceLevel / 10) * 100}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-xl text-blue-600 dark:text-blue-400">
                            {mirrorData.confidenceLevel}/10
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {(isEditing && editData ? editData[activeTab] : mirrorData[activeTab]).map((section, index) => {
                    // Get the translated title and placeholder based on tab and index
                                         const getSectionKeys = () => {
                       const sectionKeyMaps = {
                         self: [
                           { title: 'mirror.sections.self.qualities.title', placeholder: 'mirror.sections.self.qualities.placeholder' },
                           { title: 'mirror.sections.self.defects.title', placeholder: 'mirror.sections.self.defects.placeholder' },
                           { title: 'mirror.sections.self.personalGoals.title', placeholder: 'mirror.sections.self.personalGoals.placeholder' },
                           { title: 'mirror.sections.self.unique.title', placeholder: 'mirror.sections.self.unique.placeholder' }
                         ],
                         others: [
                           { title: 'mirror.sections.others.feedbackFromLovedOnes.title', placeholder: 'mirror.sections.others.feedbackFromLovedOnes.placeholder' },
                           { title: 'mirror.sections.others.strengths.title', placeholder: 'mirror.sections.others.strengths.placeholder' },
                           { title: 'mirror.sections.others.impression.title', placeholder: 'mirror.sections.others.impression.placeholder' },
                           { title: 'mirror.sections.others.improvementPoints.title', placeholder: 'mirror.sections.others.improvementPoints.placeholder' }
                         ],
                         growth: [
                           { title: 'mirror.sections.growth.workingOn.title', placeholder: 'mirror.sections.growth.workingOn.placeholder' },
                           { title: 'mirror.sections.growth.achievements.title', placeholder: 'mirror.sections.growth.achievements.placeholder' },
                           { title: 'mirror.sections.growth.next.title', placeholder: 'mirror.sections.growth.next.placeholder' },
                           { title: 'mirror.sections.growth.learnings.title', placeholder: 'mirror.sections.growth.learnings.placeholder' }
                         ]
                       }
                       return sectionKeyMaps[activeTab][index] || { title: 'mirror.content.addItem', placeholder: 'mirror.content.addItem' }
                     }
                    
                    const sectionKeys = getSectionKeys()
                    
                    return (
                      <div key={section.id} className="space-y-4">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          <FormattedMessage id={sectionKeys.title} />
                        </h4>
                        <ListEditor
                          sectionIndex={index}
                          section={section}
                          placeholder={intl.formatMessage({ id: sectionKeys.placeholder })}
                          isEditing={isEditing}
                          onAddItem={addItem}
                          onRemoveItem={removeItem}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-4">💡 <FormattedMessage id="mirror.aiTips.title" /></h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-700 dark:text-blue-200 text-sm">
            <div className="space-y-2">
              <p>• <strong><FormattedMessage id="mirror.aiTips.honest.title" /></strong> : <FormattedMessage id="mirror.aiTips.honest.description" /></p>
              <p>• <strong><FormattedMessage id="mirror.aiTips.takeTime.title" /></strong> : <FormattedMessage id="mirror.aiTips.takeTime.description" /></p>
            </div>
            <div className="space-y-2">
              <p>• <strong><FormattedMessage id="mirror.aiTips.askFeedback.title" /></strong> : <FormattedMessage id="mirror.aiTips.askFeedback.description" /></p>
              <p>• <strong><FormattedMessage id="mirror.aiTips.updateRegularly.title" /></strong> : <FormattedMessage id="mirror.aiTips.updateRegularly.description" /></p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
