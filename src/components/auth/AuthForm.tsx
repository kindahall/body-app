'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/lib/auth/AuthHandlerMCP'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, Chrome, AlertCircle, CheckCircle } from 'lucide-react'

type TabType = 'login' | 'signup'

function AuthFormContent() {
  const [activeTab, setActiveTab] = useState<TabType>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  
  const { signInWithEmail, signUp, signInWithGoogle, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // AuthHandlerMCP gère déjà les redirections automatiquement
  // Pas besoin de redirection supplémentaire ici

  useEffect(() => {
    const errorParam = searchParams.get('error')
    const messageParam = searchParams.get('message')
    
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
    }
    if (messageParam) {
      setMessage(decodeURIComponent(messageParam))
    }
  }, [searchParams])

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')
    
    if (activeTab === 'signup' && password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setIsLoading(false)
      return
    }
    
    if (activeTab === 'signup' && (!username || username.length < 3)) {
      setError('Le pseudo doit contenir au moins 3 caractères')
      setIsLoading(false)
      return
    }
    
    if (activeTab === 'signup' && username.length > 20) {
      setError('Le pseudo ne peut pas dépasser 20 caractères')
      setIsLoading(false)
      return
    }
    
    if (activeTab === 'signup' && !/^[a-zA-Z0-9_-]+$/.test(username)) {
      setError('Le pseudo ne peut contenir que des lettres, chiffres, tirets et underscores')
      setIsLoading(false)
      return
    }
    
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      setIsLoading(false)
      return
    }

    try {
      if (activeTab === 'login') {
        const { error } = await signInWithEmail(email, password)
        if (error) {
          setError(error.message)
        }
        // AuthHandlerMCP gère automatiquement la redirection après connexion
      } else {
        const { error } = await signUp(email, password, username)
        if (error) {
          setError(error.message)
        } else {
          setMessage('Vérifiez votre email pour le lien de confirmation !')
        }
        // AuthHandlerMCP gère automatiquement la redirection après inscription
      }
    } catch (err) {
      setError('Une erreur inattendue s\'est produite')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const { error } = await signInWithGoogle()
      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError('Échec de la connexion avec Google')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setUsername('')
    setError('')
    setMessage('')
  }

  const switchTab = (tab: TabType) => {
    setActiveTab(tab)
    resetForm()
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Tab Navigation */}
      <div className="flex mb-8 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => switchTab('login')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'login'
              ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Se connecter
        </button>
        <button
          onClick={() => switchTab('signup')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'signup'
              ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Créer un compte
        </button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      
      {message && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 text-green-700 dark:text-green-400">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{message}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleEmailAuth} className="space-y-4">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Entrez votre email"
              required
              aria-describedby={error ? 'email-error' : undefined}
            />
          </div>
        </div>

        {/* Username Field (Signup only) */}
        {activeTab === 'signup' && (
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Pseudo
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 flex items-center justify-center">
                @
              </div>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Choisissez votre pseudo"
                minLength={3}
                maxLength={20}
                pattern="[a-zA-Z0-9_-]+"
                title="Le pseudo ne peut contenir que des lettres, chiffres, tirets et underscores"
                required
                aria-describedby={error ? 'username-error' : undefined}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              3-20 caractères, lettres, chiffres, tirets et underscores uniquement
            </p>
          </div>
        )}

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Mot de passe
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Entrez votre mot de passe"
              minLength={8}
              required
              aria-describedby={error ? 'password-error' : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password Field (Signup only) */}
        {activeTab === 'signup' && (
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Confirmez votre mot de passe"
                minLength={8}
                required
                aria-describedby={error ? 'confirm-password-error' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Remember Me & Forgot Password (Login only) */}
        {activeTab === 'login' && (
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500 dark:focus:ring-pink-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Se souvenir de moi</span>
            </label>
            <a
              href="/auth/reset"
              className="text-sm text-pink-600 hover:text-pink-500 dark:text-pink-400 dark:hover:text-pink-300"
            >
              Mot de passe oublié ?
            </a>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{activeTab === 'login' ? 'Connexion...' : 'Création du compte...'}</span>
            </>
          ) : (
            <span>{activeTab === 'login' ? 'Se connecter' : 'Créer un compte'}</span>
          )}
        </button>
      </form>

      {/* Divider - Temporarily disabled until Google OAuth is configured */}
      {/* 
      <div className="my-6 flex items-center">
        <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
        <span className="px-4 text-sm text-gray-500 dark:text-gray-400">ou continuer avec Google</span>
        <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
      </div>

      <button
        onClick={handleGoogleAuth}
        disabled={isLoading}
        className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Chrome className="w-4 h-4" />
        <span>Continuer avec Google</span>
      </button>
      */}
    </div>
  )
}

function AuthFormSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto animate-pulse">
      <div className="flex mb-8 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        <div className="flex-1 h-8 bg-gray-200 dark:bg-gray-600 rounded-md"></div>
        <div className="flex-1 h-8 bg-gray-200 dark:bg-gray-600 rounded-md ml-1"></div>
      </div>
      <div className="space-y-4">
        <div className="h-12 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
        <div className="h-12 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
        <div className="h-12 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
      </div>
    </div>
  )
}

export default function AuthForm() {
  return (
    <Suspense fallback={<AuthFormSkeleton />}>
      <AuthFormContent />
    </Suspense>
  )
}