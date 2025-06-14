'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/AuthHandlerMCP'
import { useRouter } from 'next/navigation'
import { Settings, ArrowLeft, User, Globe, CreditCard, LogOut, Trash2, Download, HelpCircle, Sun, Moon, Mail, Coins, Calendar } from 'lucide-react'
import { createClientComponentClient } from '@/lib/supabase'

export default function SettingsPage() {
  const { user, profile, signOut } = useAuth()
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [activeTab, setActiveTab] = useState('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [credits, setCredits] = useState(0)

  // Vérifier si c'est un utilisateur de test
  const isTestUser = typeof document !== 'undefined' && 
    document.cookie.includes('test-user=true')

  const [formData, setFormData] = useState({
    email: user?.email || 'test@example.com',
    age: null as number | null
  })

  // Paramètres de l'application
  const [appSettings, setAppSettings] = useState({
    darkMode: false,
    notifications: true,
    exportFormat: 'json'
  })

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        age: null
      })
      if (!isTestUser) {
        fetchCredits()
        fetchUserProfile()
      }
    }
    
    // Charger les paramètres depuis localStorage
    const savedSettings = localStorage.getItem('bodycount-settings')
    if (savedSettings) {
      setAppSettings({ ...appSettings, ...JSON.parse(savedSettings) })
    }
  }, [user, profile])

  const fetchUserProfile = async () => {
    if (!user || isTestUser) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('age')
        .eq('id', user.id)
        .single()

      if (error) {
        console.warn('Could not fetch user profile:', error.message)
        return
      }

      setFormData(prev => ({ ...prev, age: data?.age || null }))
    } catch (error: any) {
      console.warn('Error fetching user profile:', error?.message || 'Unknown error')
    }
  }

  const updateUserAge = async (age: number) => {
    if (!user || isTestUser) return

    // Validation côté client
    if (age < 18 || age > 99) {
      setError('L\'âge doit être compris entre 18 et 99 ans.')
      setTimeout(() => setError(''), 3000)
      return
    }

    try {
      setIsLoading(true)
      
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id,
          age: age,
          updated_at: new Date().toISOString()
        })

      if (error) {
        setError('Erreur lors de la mise à jour de l\'âge.')
        return
      }

      setFormData(prev => ({ ...prev, age }))
      setMessage('Âge mis à jour avec succès!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error: any) {
      setError('Erreur lors de la mise à jour de l\'âge.')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCredits = async () => {
    if (!user || isTestUser) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single()

      if (error) {
        if (error.message?.includes('column "credits" does not exist')) {
          console.warn('Credits column not found - migration needed')
          setCredits(0)
          return
        }
        
        if (error.code === 'PGRST116') {
          console.log('Profile not found, credits will be 0 until profile is created')
          setCredits(0)
          return
        }
        
        console.error('Error fetching credits:', error)
        setCredits(0)
        return
      }

      setCredits(data?.credits || 0)
    } catch (error: any) {
      console.warn('Credits feature not available yet:', error?.message || 'Unknown error')
      setCredits(0)
    }
  }

  const saveAppSettings = (newSettings: any) => {
    const updatedSettings = { ...appSettings, ...newSettings }
    setAppSettings(updatedSettings)
    localStorage.setItem('bodycount-settings', JSON.stringify(updatedSettings))
    setMessage('Paramètres sauvegardés!')
    setTimeout(() => setMessage(''), 2000)
  }

  const handleSignOut = async () => {
    if (isTestUser) {
      document.cookie = 'test-user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      router.push('/auth')
      return
    }
    await signOut()
  }

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'preferences', label: 'Préférences', icon: Settings },
    { id: 'account', label: 'Compte', icon: CreditCard },
    { id: 'data', label: 'Données', icon: Download },
    { id: 'help', label: 'Aide', icon: HelpCircle }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-20 right-20 w-32 h-32 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-32 h-32 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse animation-delay-1000"></div>
      </div>

      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-20">
            <button
              onClick={() => router.push('/home')}
              className="group flex items-center space-x-3 text-gray-600 hover:text-indigo-600 transition-all duration-300 mr-8 p-2 rounded-xl hover:bg-white/50"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Retour</span>
            </button>
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-3 rounded-2xl shadow-lg animate-pulse">
                <Settings className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Paramètres
                </h1>
                <p className="text-gray-500 text-sm">Gérez votre compte et préférences</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      {message && (
        <div className="fixed top-24 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50 animate-slide-in-right">
          <p className="font-medium">{message}</p>
        </div>
      )}

      {error && (
        <div className="fixed top-24 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50 animate-slide-in-right">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar avec onglets */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="bg-white/80 backdrop-blur-md rounded-2xl p-2 shadow-lg border border-white/20 sticky top-8">
              {tabs.map((tab) => {
                const IconComponent = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 mb-2 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105'
                        : 'text-gray-600 hover:bg-white/60 hover:text-indigo-600'
                    }`}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Contenu principal */}
          <div className="flex-1">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mb-4">
                    <User className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    Informations du profil
                  </h3>
                  <p className="text-gray-500">Gérez vos informations personnelles</p>
                </div>
                  
                <div className="grid gap-6 max-w-2xl mx-auto">
                  <div className="bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
                    <label className="flex items-center space-x-3 text-lg font-semibold text-gray-800 mb-4">
                      <div className="bg-indigo-100 p-2 rounded-lg">
                        <Mail className="h-5 w-5 text-indigo-600" />
                      </div>
                      <span>Adresse email</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full px-6 py-4 border border-gray-200/50 rounded-xl bg-gray-50/80 text-gray-700 font-medium backdrop-blur-sm"
                    />
                    <p className="text-sm text-gray-500 mt-3 flex items-center space-x-2">
                      <span className="w-2 h-2 bg-gray-400 rounded-full block"></span>
                      <span>L'email ne peut pas être modifié</span>
                    </p>
                  </div>

                  {/* Champ âge */}
                  <div className="bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
                    <label className="flex items-center space-x-3 text-lg font-semibold text-gray-800 mb-4">
                      <div className="bg-yellow-100 p-2 rounded-lg">
                        <Calendar className="h-5 w-5 text-yellow-600" />
                      </div>
                      <span>Âge <span className="text-red-500">*</span></span>
                    </label>
                    
                    {isTestUser ? (
                      <>
                        <div className="w-full px-6 py-4 border border-gray-200/50 rounded-xl bg-gray-50/80 text-gray-700 font-medium backdrop-blur-sm">
                          Mode test - Âge non requis
                        </div>
                        <p className="text-sm text-yellow-600 mt-3 flex items-center space-x-2">
                          <span className="w-2 h-2 bg-yellow-400 rounded-full block"></span>
                          <span>L'âge n'est pas collecté en mode test</span>
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="flex gap-3">
                          <input
                            type="number"
                            min="18"
                            max="99"
                            value={formData.age || ''}
                            onChange={(e) => {
                              const value = e.target.value
                              setFormData(prev => ({ 
                                ...prev, 
                                age: value ? parseInt(value) : null 
                              }))
                            }}
                            placeholder="Votre âge (18-99 ans)"
                            className="flex-1 px-6 py-4 border border-gray-200/50 rounded-xl bg-white/80 text-gray-700 font-medium backdrop-blur-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          />
                          <button
                            onClick={() => formData.age && updateUserAge(formData.age)}
                            disabled={!formData.age || formData.age < 18 || formData.age > 99 || isLoading}
                            className="px-6 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg"
                          >
                            {isLoading ? '...' : 'Sauver'}
                          </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-3 flex items-center space-x-2">
                          <span className="w-2 h-2 bg-yellow-400 rounded-full block"></span>
                          <span>L'âge est requis pour calibrer les analyses IA selon votre tranche d'âge</span>
                        </p>
                        {formData.age && (formData.age < 18 || formData.age > 99) && (
                          <p className="text-sm text-red-500 mt-2 flex items-center space-x-2">
                            <span className="w-2 h-2 bg-red-400 rounded-full block"></span>
                            <span>L'âge doit être compris entre 18 et 99 ans</span>
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200/50 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="bg-blue-500 p-2 rounded-lg">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-blue-900">Profil utilisateur</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white/60 rounded-xl p-4 backdrop-blur-sm">
                        <p className="text-sm text-gray-600 mb-1">Statut</p>
                        <p className="font-bold text-blue-700">
                          {isTestUser ? '🧪 Test' : '✅ Authentifié'}
                        </p>
                      </div>
                      <div className="bg-white/60 rounded-xl p-4 backdrop-blur-sm">
                        <p className="text-sm text-gray-600 mb-1">Âge</p>
                        <p className="font-bold text-blue-700">
                          {isTestUser ? 'N/A' : (formData.age ? `${formData.age} ans` : 'Non défini')}
                        </p>
                      </div>
                      <div className="bg-white/60 rounded-xl p-4 backdrop-blur-sm">
                        <p className="text-sm text-gray-600 mb-1">Plan actuel</p>
                        <p className="font-bold text-blue-700">💎 Gratuit avec crédits</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Autres onglets ici... */}
            {activeTab !== 'profile' && (
              <div className="text-center py-16">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Onglet {activeTab}
                </h3>
                <p className="text-gray-600">
                  Contenu de l'onglet en cours de développement
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Styles CSS personnalisés */}
      <style jsx>{`
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
        
        .animate-in {
          animation: fadeIn 0.5s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
} 