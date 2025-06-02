'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/AuthHandlerMCP'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@/lib/supabase'
import { ChevronRight, Globe, Heart } from 'lucide-react'

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
]

export default function OnboardingPage() {
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { user, updateLanguage } = useAuth()
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleComplete = async () => {
    if (!user) return

    setIsLoading(true)
    setError('')

    try {
      // Update user profile with selected language
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email!,
          lang: selectedLanguage,
          subscription_status: 'free'
        })

      if (profileError) {
        throw profileError
      }

      // Update language in auth context
      await updateLanguage(selectedLanguage)

      // Redirect to home
      router.push('/home')
    } catch (error) {
      console.error('Onboarding error:', error)
      setError('Failed to complete setup. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-full">
              <Heart className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to BodyCount</h1>
          <p className="text-gray-600">Let's set up your profile</p>
        </div>

        {/* Onboarding Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Language Selection */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Globe className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Choose your language</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => setSelectedLanguage(language.code)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left flex items-center justify-between ${
                    selectedLanguage === language.code
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{language.flag}</span>
                    <span className="font-medium text-gray-900">{language.name}</span>
                  </div>
                  {selectedLanguage === language.code && (
                    <div className="w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Welcome Message */}
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6 space-y-3">
            <h3 className="font-semibold text-gray-900">What you can do with BodyCount:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-pink-500 rounded-full" />
                <span>Track romantic, sexual, and friendship relationships</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <span>Record emotions, places, and private notes</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span>Get personalized AI insights and recommendations</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Upgrade for higher relationship quotas</span>
              </li>
            </ul>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleComplete}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
          >
            <span>{isLoading ? 'Setting up...' : 'Continue to BodyCount'}</span>
            {!isLoading && <ChevronRight className="h-5 w-5" />}
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500">
          You can change these settings later in your profile
        </p>
      </div>
    </div>
  )
}