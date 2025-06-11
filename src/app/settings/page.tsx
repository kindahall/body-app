'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/AuthHandlerMCP'
import { useRouter } from 'next/navigation'
import { Settings, ArrowLeft, User, Globe, CreditCard, LogOut, Trash2, Download, HelpCircle, Sun, Moon, Mail, Coins, Shield, Smartphone, Key, AlertTriangle, FileDown, Eye, EyeOff, Clock, MessageSquare, ExternalLink, Video, Search, ChevronDown, ChevronRight, Star, Badge, FileText, History, Lock, Zap, RotateCcw } from 'lucide-react'
import { createClientComponentClient } from '@/lib/supabase'
import AgeInput from '@/components/AgeInput'

export default function SettingsPage() {
  const { user, profile, signOut, updateUsername } = useAuth()
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
    age: null as number | null,
    username: (profile as any)?.username || ''
  })

  // Paramètres de l'application
  const [appSettings, setAppSettings] = useState({
    darkMode: false,
    notifications: true,
    exportFormat: 'json'
  })

  // Modal changement de mot de passe
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  // 2FA States
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [show2FAModal, setShow2FAModal] = useState(false)
  const [twoFactorSetup, setTwoFactorSetup] = useState({
    secret: '',
    qrCode: '',
    backupCodes: [] as string[],
    verificationCode: '',
    step: 'setup' as 'setup' | 'verify' | 'complete'
  })

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        age: null,
        username: (profile as any)?.username || ''
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
      setError('Age must be between 18 and 99 years.')
      setTimeout(() => setError(''), 3000)
      return
    }

    try {
      setIsLoading(true)
      
      console.log('🔄 Attempting to update age:', age, 'for user:', user.id)
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          age: age
        })
        .eq('id', user.id)
        .select()

      console.log('📊 Supabase response:', { data, error })

      if (error) {
        console.error('❌ Supabase error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        
        // Messages d'erreur spécifiques selon le code
        if (error.code === 'PGRST116') {
          setError('Profile not found. Please log in again.')
        } else if (error.code === '42501') {
          setError('Insufficient permissions. Please check your access.')
        } else if (error.message?.includes('relation "profiles" does not exist')) {
          setError('Profiles table missing. Database configuration required.')
        } else {
          setError(`Database error: ${error.message}`)
        }
        return
      }

      console.log('✅ Age updated successfully:', data)
      setFormData(prev => ({ ...prev, age }))
      setMessage('Age updated successfully!')
      setTimeout(() => setMessage(''), 3000)
      
    } catch (error: any) {
      console.error('❌ JavaScript error in updateUserAge:', {
        error,
        message: error?.message,
        stack: error?.stack,
        name: error?.name
      })
      
      if (error?.message) {
        setError(`Error: ${error.message}`)
      } else {
        setError('Unknown error when updating age.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const updateUserUsername = async (username: string) => {
    if (!user || isTestUser) return

    // Validation côté client
    if (!username || username.length < 3) {
      setError('Username must contain at least 3 characters.')
      setTimeout(() => setError(''), 3000)
      return
    }

    if (username.length > 20) {
      setError('Username cannot exceed 20 characters.')
      setTimeout(() => setError(''), 3000)
      return
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      setError('Username can only contain letters, numbers, hyphens and underscores.')
      setTimeout(() => setError(''), 3000)
      return
    }

    try {
      setIsLoading(true)
      
      const { error } = await updateUsername(username)

      if (error) {
        setError(error.message || 'Error updating username.')
        return
      }

      setFormData(prev => ({ ...prev, username }))
      setMessage('Username updated successfully!')
      setTimeout(() => setMessage(''), 3000)
      
    } catch (error: any) {
      console.error('❌ JavaScript error in updateUserUsername:', error)
      
      if (error?.message) {
        setError(`Error: ${error.message}`)
      } else {
        setError('Unknown error when updating username.')
      }
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
    setMessage('Settings saved!')
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

  const handleExportData = async () => {
    setIsLoading(true)
    try {
      // Simuler l'export de données
      const userData = {
        profile: formData,
        settings: appSettings,
        exportDate: new Date().toISOString(),
        credits: credits
      }
      
      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bodycount-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      setMessage('Données exportées avec succès')
    } catch (error) {
      setError('Erreur lors de l\'export des données')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAllData = async () => {
    if (!confirm('⚠️ Êtes-vous sûr de vouloir supprimer TOUTES vos données ? Cette action est irréversible.')) return
    
    setIsLoading(true)
    try {
      if (isTestUser) {
        localStorage.removeItem('test-relations')
        localStorage.removeItem('test-confessions')
        localStorage.removeItem('test-profile')
        setMessage('Toutes les données de test ont été supprimées')
      } else {
        // Ici vous pourriez ajouter l'appel API pour supprimer les données
        setMessage('Fonctionnalité en développement')
      }
    } catch (error) {
      setError('Erreur lors de la suppression des données')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmText = 'DELETE'
    const userInput = prompt(`⚠️ WARNING: This action is IRREVERSIBLE!\n\nYour account and ALL your data will be permanently deleted.\n\nType "${confirmText}" to confirm:`)
    
    if (userInput !== confirmText) {
      alert('Deletion cancelled')
      return
    }

    if (isTestUser) {
      document.cookie = 'test-user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      router.push('/auth')
      return
    }

    try {
      await handleSignOut()
      router.push('/auth?deleted=true')
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('Error deleting account')
    }
  }

  const handleChangePassword = () => {
    if (isTestUser) {
      alert('Fonctionnalité non disponible en mode test')
      return
    }
    setShowPasswordModal(true)
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas')
      return
    }
    
    if (passwordForm.newPassword.length < 8) {
      setError('Le nouveau mot de passe doit contenir au moins 8 caractères')
      return
    }
    
    setIsLoading(true)
    try {
      // Utiliser Supabase pour changer le mot de passe
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      })
      
      if (error) {
        setError(error.message)
      } else {
        setMessage('Mot de passe mis à jour avec succès!')
        setShowPasswordModal(false)
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      }
    } catch (error) {
      setError('Erreur lors du changement de mot de passe')
    } finally {
      setIsLoading(false)
    }
  }

  const closePasswordModal = () => {
    setShowPasswordModal(false)
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setError('')
  }

  const handleDisableAccount = async () => {
    if (!confirm('Voulez-vous vraiment désactiver temporairement votre compte ?')) return
    
    setIsLoading(true)
    try {
      setMessage('Fonctionnalité en développement - contactez le support')
    } catch (error) {
      setError('Erreur lors de la désactivation du compte')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendSupportMessage = () => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement
    const message = textarea?.value.trim()
    
    if (!message) {
      alert('Veuillez entrer votre message avant d\'envoyer')
      return
    }
    
    // Simuler l'envoi du message
    const mailtoLink = `mailto:support@bodycount.app?subject=Demande de support&body=${encodeURIComponent(message)}`
    window.open(mailtoLink)
    
    textarea.value = ''
    setMessage('Message envoyé ! Nous vous répondrons sous 24h.')
  }

  const handleOpenDiscord = () => {
    window.open('https://discord.gg/bodycount', '_blank')
  }

  const handleWatchTutorial = () => {
    setMessage('Les tutoriels vidéo seront bientôt disponibles !')
  }

  const handleFeatureRequest = () => {
    const feature = prompt('What feature would you like to see in BodyCount?')
    if (feature?.trim()) {
              const mailtoLink = `mailto:support@bodycount.app?subject=Feature Request&body=${encodeURIComponent(`Requested feature: ${feature}`)}`
      window.open(mailtoLink)
              setMessage('Thank you for your suggestion! We will review it.')
    }
  }

  // Fonctions 2FA
  const generateTwoFactorSecret = async () => {
    try {
      const speakeasy = (await import('speakeasy')).default
      const qrcode = (await import('qrcode')).default

      const secret = speakeasy.generateSecret({
        name: `BodyCount (${formData.email})`,
        length: 32
      })

      const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!)
      
      // Générer des codes de sauvegarde
      const backupCodes = Array.from({ length: 8 }, () => 
        Math.random().toString(36).substring(2, 8).toUpperCase()
      )

      setTwoFactorSetup({
        secret: secret.base32,
        qrCode: qrCodeUrl,
        backupCodes,
        verificationCode: '',
        step: 'setup'
      })

      setShow2FAModal(true)
    } catch (error) {
      setError('Erreur lors de la génération du secret 2FA')
    }
  }

  const verifyTwoFactorCode = async () => {
    try {
      const speakeasy = (await import('speakeasy')).default
      
      const verified = speakeasy.totp.verify({
        secret: twoFactorSetup.secret,
        encoding: 'base32',
        token: twoFactorSetup.verificationCode,
        window: 2
      })

      if (verified) {
        // Sauvegarder la 2FA dans la base de données (ou localStorage pour les tests)
        if (isTestUser) {
          localStorage.setItem('test-2fa-enabled', 'true')
          localStorage.setItem('test-2fa-secret', twoFactorSetup.secret)
          localStorage.setItem('test-backup-codes', JSON.stringify(twoFactorSetup.backupCodes))
        } else {
          // Ici vous pourriez sauvegarder dans Supabase
          // await supabase.from('user_2fa').upsert({ user_id: user.id, secret: twoFactorSetup.secret })
        }

        setTwoFactorEnabled(true)
        setTwoFactorSetup(prev => ({ ...prev, step: 'complete' }))
        setMessage('Authentification à deux facteurs activée avec succès!')
      } else {
        setError('Code de vérification incorrect. Veuillez réessayer.')
      }
    } catch (error) {
      setError('Erreur lors de la vérification du code')
    }
  }

  const disableTwoFactor = async () => {
    if (!confirm('Êtes-vous sûr de vouloir désactiver l\'authentification à deux facteurs ?')) return

    try {
      if (isTestUser) {
        localStorage.removeItem('test-2fa-enabled')
        localStorage.removeItem('test-2fa-secret')
        localStorage.removeItem('test-backup-codes')
      } else {
        // Ici vous pourriez supprimer de Supabase
        // await supabase.from('user_2fa').delete().eq('user_id', user.id)
      }

      setTwoFactorEnabled(false)
      setMessage('Authentification à deux facteurs désactivée')
    } catch (error) {
      setError('Erreur lors de la désactivation de la 2FA')
    }
  }

  const close2FAModal = () => {
    setShow2FAModal(false)
    setTwoFactorSetup({
      secret: '',
      qrCode: '',
      backupCodes: [],
      verificationCode: '',
      step: 'setup'
    })
  }

  // Charger l'état 2FA au démarrage
  useEffect(() => {
    if (isTestUser) {
      const enabled = localStorage.getItem('test-2fa-enabled') === 'true'
      setTwoFactorEnabled(enabled)
    } else {
      // Ici vous pourriez charger depuis Supabase
      // fetchTwoFactorStatus()
    }
  }, [isTestUser])

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'account', label: 'Account', icon: CreditCard },
    { id: 'data', label: 'Data', icon: Download },
    { id: 'help', label: 'Help', icon: HelpCircle }
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
              <span className="font-medium">Back</span>
            </button>
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-3 rounded-2xl shadow-lg animate-pulse">
                <Settings className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Settings
                </h1>
                <p className="text-gray-500 text-sm">Manage your account and preferences</p>
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
                    Profile Information
                  </h3>
                  <p className="text-gray-500">Manage your personal information</p>
                </div>
                  
                <div className="grid gap-6 max-w-2xl mx-auto">
                  <div className="bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
                    <label className="flex items-center space-x-3 text-lg font-semibold text-gray-800 mb-4">
                      <div className="bg-indigo-100 p-2 rounded-lg">
                        <Mail className="h-5 w-5 text-indigo-600" />
                      </div>
                      <span>Email Address</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full px-6 py-4 border border-gray-200/50 rounded-xl bg-gray-50/80 text-gray-700 font-medium backdrop-blur-sm"
                    />
                    <p className="text-sm text-gray-500 mt-3 flex items-center space-x-2">
                      <span className="w-2 h-2 bg-gray-400 rounded-full block"></span>
                      <span>Email cannot be modified</span>
                    </p>
                  </div>

                  {/* Pseudo */}
                  <div className="bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
                    <label className="flex items-center space-x-3 text-lg font-semibold text-gray-800 mb-4">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <Badge className="h-5 w-5 text-green-600" />
                      </div>
                      <span>Username</span>
                    </label>
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">
                          @
                        </div>
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                          placeholder="Choose your username"
                          className="w-full pl-8 pr-6 py-4 border border-gray-200/50 rounded-xl bg-white/80 text-gray-700 font-medium backdrop-blur-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                          minLength={3}
                          maxLength={20}
                          pattern="[a-zA-Z0-9_-]+"
                          title="Username can only contain letters, numbers, hyphens and underscores"
                        />
                      </div>
                      <button
                        onClick={() => updateUserUsername(formData.username)}
                        disabled={isLoading || !formData.username || formData.username === (profile as any)?.username}
                        className="px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {isLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <Badge className="h-4 w-4" />
                            <span>Update</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="mt-3 space-y-1">
                      <p className="text-sm text-gray-500 flex items-center space-x-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full block"></span>
                        <span>3-20 characters, letters, numbers, hyphens and underscores only</span>
                      </p>
                      {formData.username && (
                        <p className="text-sm text-gray-600 font-medium">
                          Preview: @{formData.username}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Composant âge */}
                  <AgeInput
                    currentAge={formData.age}
                    onAgeUpdate={updateUserAge}
                    isLoading={isLoading}
                    isTestUser={isTestUser}
                  />

                  <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200/50 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="bg-blue-500 p-2 rounded-lg">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-blue-900">User Profile</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white/60 rounded-xl p-4 backdrop-blur-sm">
                        <p className="text-sm text-gray-600 mb-1">Status</p>
                        <p className="font-bold text-blue-700">
                          {isTestUser ? '🧪 Test' : '✅ Authenticated'}
                        </p>
                      </div>
                      <div className="bg-white/60 rounded-xl p-4 backdrop-blur-sm">
                        <p className="text-sm text-gray-600 mb-1">Username</p>
                        <p className="font-bold text-blue-700">
                          {formData.username ? `@${formData.username}` : 'Not set'}
                        </p>
                      </div>
                      <div className="bg-white/60 rounded-xl p-4 backdrop-blur-sm">
                        <p className="text-sm text-gray-600 mb-1">Age</p>
                        <p className="font-bold text-blue-700">
                          {isTestUser ? 'N/A' : (formData.age ? `${formData.age} years` : 'Not set')}
                        </p>
                      </div>
                      <div className="bg-white/60 rounded-xl p-4 backdrop-blur-sm">
                        <p className="text-sm text-gray-600 mb-1">Current Plan</p>
                        <p className="font-bold text-blue-700">💎 Free with credits</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
                    <Settings className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    Display Preferences
                  </h3>
                  <p className="text-gray-500">Customize your user experience</p>
                </div>

                <div className="grid gap-6 max-w-2xl mx-auto">
                  {/* Mode sombre */}
                  <div className="bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gray-100 p-2 rounded-lg">
                          {appSettings.darkMode ? <Moon className="h-5 w-5 text-gray-600" /> : <Sun className="h-5 w-5 text-yellow-600" />}
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800">Dark Mode</h4>
                          <p className="text-sm text-gray-500">Interface optimized for nighttime use</p>
                        </div>
                      </div>
                      <button
                        onClick={() => saveAppSettings({ darkMode: !appSettings.darkMode })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          appSettings.darkMode ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            appSettings.darkMode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Notifications */}
                  <div className="bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <MessageSquare className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800">Notifications</h4>
                          <p className="text-sm text-gray-500">Receive alerts and reminders</p>
                        </div>
                      </div>
                      <button
                        onClick={() => saveAppSettings({ notifications: !appSettings.notifications })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          appSettings.notifications ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            appSettings.notifications ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-4">
                    <CreditCard className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                    Account Management
                  </h3>
                  <p className="text-gray-500">Security, subscription and account settings</p>
                </div>

                <div className="space-y-6 max-w-2xl mx-auto">
                  {/* Identifiants */}
                  <div className="bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                      <Key className="h-5 w-5 text-blue-600" />
                      <span>Credentials</span>
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input
                          type="email"
                          value={formData.email}
                          disabled
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-700"
                        />
                        <p className="text-xs text-gray-500 mt-1">Authentication via magic link</p>
                      </div>
                      <button 
                        onClick={handleChangePassword}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-colors"
                      >
                        Change Password
                      </button>
                    </div>
                  </div>

                  {/* Sécurité avancée */}
                  <div className="bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      <span>Advanced Security</span>
                    </h4>
                    <div className="space-y-4">
                      <div className={`flex items-center justify-between p-4 rounded-xl ${
                        twoFactorEnabled ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                      }`}>
                        <div className="flex items-center space-x-3">
                          <Smartphone className={`h-5 w-5 ${twoFactorEnabled ? 'text-green-600' : 'text-gray-500'}`} />
                          <div>
                            <p className="font-medium text-gray-800">Two-Factor Authentication</p>
                            <p className="text-sm text-gray-500">
                              {twoFactorEnabled 
                                ? 'Active protection with Google Authenticator' 
                                : 'Enhanced protection with authenticator app'
                              }
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {twoFactorEnabled ? (
                            <>
                              <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                                ✅ Enabled
                              </span>
                              <button
                                onClick={disableTwoFactor}
                                className="text-sm bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-full transition-colors"
                              >
                                Disable
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={generateTwoFactorSecret}
                              disabled={isTestUser && isLoading}
                              className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition-colors disabled:opacity-50"
                            >
                              Enable
                            </button>
                          )}
                        </div>
                      </div>
                      <button className="w-full bg-gray-100 text-gray-400 font-medium py-3 px-4 rounded-xl" disabled>
                        Manage Active Sessions
                      </button>
                    </div>
                  </div>

                  {/* Abonnement */}
                  <div className="bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                      <Coins className="h-5 w-5 text-yellow-600" />
                      <span>Subscription & Credits</span>
                    </h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-yellow-50 p-4 rounded-xl">
                          <p className="text-sm text-gray-600">Current Plan</p>
                          <p className="font-bold text-yellow-700">💎 Free</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-xl">
                          <p className="text-sm text-gray-600">Remaining Credits</p>
                          <p className="font-bold text-blue-700">{credits} credits</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => router.push('/credits')}
                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-medium py-3 px-4 rounded-xl transition-all"
                      >
                        Buy Credits
                      </button>
                    </div>
                  </div>

                  {/* Zone sensible */}
                  <div className="bg-gradient-to-r from-red-50/80 to-red-100/60 backdrop-blur-sm rounded-2xl p-6 border border-red-200/50 shadow-lg">
                    <h4 className="text-lg font-semibold text-red-800 mb-4 flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <span>Danger Zone</span>
                    </h4>
                    <div className="space-y-3">
                      <button 
                        onClick={handleDisableAccount}
                        className="w-full bg-red-100 hover:bg-red-200 text-red-700 font-medium py-3 px-4 rounded-xl transition-colors border border-red-300"
                      >
                        Temporarily Disable My Account
                      </button>
                      <button 
                        onClick={handleDeleteAccount}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Permanently Delete My Account</span>
                      </button>
                      <p className="text-xs text-red-600 text-center">This action is irreversible</p>
                    </div>
                  </div>

                  {/* Sign Out */}
                  <div className="text-center pt-4">
                    <button
                      onClick={handleSignOut}
                      className="inline-flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-xl transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Data Tab */}
            {activeTab === 'data' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-teal-500 rounded-full mb-4">
                    <Download className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-2">
                    Data Management
                  </h3>
                  <p className="text-gray-500">Export, deletion and privacy of your data</p>
                </div>

                <div className="space-y-6 max-w-2xl mx-auto">
                  {/* Export */}
                  <div className="bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                      <FileDown className="h-5 w-5 text-green-600" />
                      <span>Data Export</span>
                    </h4>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Download a complete copy of all your personal data in JSON format.
                      </p>
                      <div className="flex space-x-3">
                        <button 
                          onClick={handleExportData}
                          disabled={isLoading}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-xl transition-colors disabled:opacity-50"
                        >
                          {isLoading ? 'Generating...' : 'Download My Data (JSON)'}
                        </button>
                        <button 
                          onClick={() => setMessage('ZIP export coming soon!')}
                          className="px-4 py-3 border border-green-600 text-green-600 hover:bg-green-50 rounded-xl transition-colors"
                        >
                          ZIP
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">
                        The file will be generated and downloaded automatically (usually less than 1 MB)
                      </p>
                    </div>
                  </div>

                  {/* Effacement */}
                  <div className="bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                      <RotateCcw className="h-5 w-5 text-orange-600" />
                      <span>Data Reset</span>
                    </h4>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Delete all your personal data while keeping your account.
                      </p>
                      <button 
                        onClick={handleDeleteAllData}
                        disabled={isLoading}
                        className="w-full bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium py-3 px-4 rounded-xl transition-colors border border-orange-300 disabled:opacity-50"
                      >
                        {isLoading ? 'Deleting...' : 'Delete All My Data'}
                      </button>
                      <p className="text-xs text-orange-600">
                        Your account will be kept but all your data will be erased
                      </p>
                    </div>
                  </div>

                  {/* Consentements */}
                  <div className="bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                      <Eye className="h-5 w-5 text-blue-600" />
                      <span>Consents and Privacy</span>
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-800">Anonymous interaction analysis</p>
                          <p className="text-sm text-gray-500">Helps improve user experience</p>
                        </div>
                        <button
                          className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none bg-blue-600"
                        >
                          <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition-transform" />
                        </button>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="text-sm font-medium text-gray-700 mb-2">Accepted Terms History</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>Version 2.1 - Terms of Service</span>
                            <span>Dec 15, 2024</span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>Version 2.0 - Privacy Policy</span>
                            <span>Dec 01, 2024</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rétention */}
                  <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-200/50 shadow-lg">
                    <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <span>Retention Policy</span>
                    </h4>
                    <div className="space-y-3">
                      <div className="bg-white/60 p-4 rounded-xl">
                        <p className="text-sm text-blue-800">
                          📅 <strong>Retention:</strong> Your data is kept for 24 months after your last login
                        </p>
                      </div>
                      <div className="bg-white/60 p-4 rounded-xl">
                        <p className="text-sm text-blue-800">
                          🔒 <strong>Anonymization:</strong> After this period, it is automatically anonymized
                        </p>
                      </div>
                      <div className="bg-white/60 p-4 rounded-xl">
                        <p className="text-sm text-blue-800">
                          🗂️ <strong>Backup:</strong> Backups are deleted after an additional 6 months
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Help Tab */}
            {activeTab === 'help' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
                    <HelpCircle className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    Help Center
                  </h3>
                  <p className="text-gray-500">Guides, support and useful resources</p>
                </div>

                <div className="space-y-6 max-w-2xl mx-auto">
                  {/* FAQ Interactive */}
                  <div className="bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                      <Search className="h-5 w-5 text-purple-600" />
                      <span>Frequently Asked Questions</span>
                    </h4>
                    <div className="space-y-4">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search in FAQ..."
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                        <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                      </div>
                      
                      <div className="space-y-2">
                        {[
                          "How to use AI for my insights?",
                          "What to do if I forgot my password?",
                          "How to delete my account?",
                          "How to buy credits?",
                          "Why are some features paid?",
                          "How to export my data?"
                        ].map((question, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg">
                            <button className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50">
                              <span className="text-sm font-medium text-gray-700">{question}</span>
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Guides & Tutoriels */}
                  <div className="bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                      <Video className="h-5 w-5 text-red-600" />
                      <span>Guides & Tutorials</span>
                    </h4>
                    <div className="space-y-4">
                      <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <Video className="h-6 w-6 text-red-600" />
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-800">Getting Started Guide</h5>
                            <p className="text-sm text-gray-600">Discover BodyCount in 5 minutes</p>
                          </div>
                        </div>
                        <button 
                          onClick={handleWatchTutorial}
                          className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                        >
                          Watch Tutorial
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-xl text-center">
                          <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-800">PDF Guide</p>
                          <p className="text-xs text-gray-600">Complete user manual</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-xl text-center">
                          <MessageSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-800">Webinars</p>
                          <p className="text-xs text-gray-600">Live sessions</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Support */}
                  <div className="bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                      <span>Contact Support</span>
                    </h4>
                    <div className="space-y-4">
                      <textarea
                        placeholder="Describe your problem or question..."
                        rows={4}
                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <button 
                          onClick={handleSendSupportMessage}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-colors"
                        >
                          Send Message
                        </button>
                        <button 
                          onClick={handleOpenDiscord}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>Discord</span>
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 text-center">
                        Response usually within 24h • support@bodycount.app
                      </p>
                    </div>
                  </div>

                  {/* Changelog & Roadmap */}
                  <div className="bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                      <History className="h-5 w-5 text-indigo-600" />
                      <span>What's New & Roadmap</span>
                    </h4>
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">v2.1.0 - Age System</p>
                            <p className="text-xs text-gray-600">December 15, 2024</p>
                          </div>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full ml-auto">New</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">v2.0.0 - Complete UI Redesign</p>
                            <p className="text-xs text-gray-600">December 01, 2024</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">v2.2.0 - 2FA Authentication</p>
                            <p className="text-xs text-gray-600">Planned January 2025</p>
                          </div>
                          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full ml-auto">Planned</span>
                        </div>
                      </div>
                      <button 
                        onClick={handleFeatureRequest}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2"
                      >
                        <Star className="h-4 w-4" />
                        <span>Suggest a Feature</span>
                      </button>
                    </div>
                  </div>

                  {/* Statut */}
                  <div className="bg-gradient-to-r from-gray-50/80 to-gray-100/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                      <Zap className="h-5 w-5 text-yellow-600" />
                      <span>Status of the application</span>
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-gray-700">All operational services</span>
                        </div>
                        <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1">
                          <ExternalLink className="h-3 w-3" />
                          <span>Status page</span>
                        </button>
                      </div>
                      <div className="bg-white/60 p-4 rounded-xl">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Version of the application</span>
                          <span className="font-mono text-gray-800 bg-gray-200 px-2 py-1 rounded">v2.1.0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal de changement de mot de passe */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
            {/* Header du modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full">
                  <Key className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Change Password
                </h3>
              </div>
              <button
                onClick={closePasswordModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenu du modal */}
            <form onSubmit={handlePasswordUpdate} className="p-6 space-y-4">
              {/* Mot de passe actuel */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter your current password"
                    required
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Nouveau mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter your new password"
                    minLength={8}
                    required
                  />
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
              </div>

              {/* Confirmation nouveau mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Confirm your new password"
                    minLength={8}
                    required
                  />
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closePasswordModal}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Changing...</span>
                    </>
                  ) : (
                    <span>Change Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de configuration 2FA */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header du modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                  <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Configuration 2FA
                </h3>
              </div>
              <button
                onClick={close2FAModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <span className="sr-only">Fermer</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenu du modal */}
            <div className="p-6">
              {twoFactorSetup.step === 'setup' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Étape 1: Scanner le QR Code
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Utilisez Google Authenticator ou une autre app TOTP pour scanner ce code
                    </p>
                  </div>

                  {/* QR Code */}
                  <div className="flex justify-center">
                    <div className="bg-white p-4 rounded-xl shadow-lg">
                      <img
                        src={twoFactorSetup.qrCode}
                        alt="QR Code pour 2FA"
                        className="w-48 h-48"
                      />
                    </div>
                  </div>

                  {/* Secret manuel */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                      Code secret (si vous ne pouvez pas scanner) :
                    </h5>
                    <code className="text-sm bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded font-mono break-all">
                      {twoFactorSetup.secret}
                    </code>
                  </div>

                  {/* Instructions */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                    <h5 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                      📱 Instructions :
                    </h5>
                    <ol className="text-sm text-blue-800 dark:text-blue-400 space-y-1 list-decimal list-inside">
                      <li>Téléchargez Google Authenticator sur votre téléphone</li>
                      <li>Ouvrez l'app et appuyez sur "+"</li>
                      <li>Choisissez "Scanner un code QR"</li>
                      <li>Scannez le QR code ci-dessus</li>
                      <li>Entrez le code à 6 chiffres généré</li>
                    </ol>
                  </div>

                  {/* Champ de vérification */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Code de vérification (6 chiffres)
                    </label>
                    <input
                      type="text"
                      value={twoFactorSetup.verificationCode}
                      onChange={(e) => setTwoFactorSetup(prev => ({ 
                        ...prev, 
                        verificationCode: e.target.value.replace(/\D/g, '').slice(0, 6) 
                      }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-lg font-mono"
                      placeholder="000000"
                      maxLength={6}
                    />
                  </div>

                  {/* Boutons */}
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={close2FAModal}
                      className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={verifyTwoFactorCode}
                      disabled={twoFactorSetup.verificationCode.length !== 6 || isLoading}
                      className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Vérification...' : 'Vérifier'}
                    </button>
                  </div>
                </div>
              )}

              {twoFactorSetup.step === 'complete' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      2FA Activée avec succès ! 🎉
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Votre compte est maintenant protégé par l'authentification à deux facteurs
                    </p>
                  </div>

                  {/* Codes de sauvegarde */}
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-xl">
                    <h5 className="font-medium text-yellow-900 dark:text-yellow-300 mb-3 flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Codes de sauvegarde importants
                    </h5>
                    <p className="text-sm text-yellow-800 dark:text-yellow-400 mb-3">
                      Sauvegardez ces codes dans un endroit sûr. Ils vous permettront d'accéder à votre compte si vous perdez votre téléphone :
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {twoFactorSetup.backupCodes.map((code, index) => (
                        <code key={index} className="bg-white dark:bg-gray-700 px-3 py-2 rounded text-sm font-mono border">
                          {code}
                        </code>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={close2FAModal}
                    className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors"
                  >
                    Terminer la configuration
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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