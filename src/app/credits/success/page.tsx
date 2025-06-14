'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, ArrowRight, Home } from 'lucide-react'

function CreditsSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/home')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Animated Background */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      <div className="absolute top-20 right-20 w-32 h-32 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
      <div className="absolute bottom-20 left-20 w-32 h-32 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>

      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-12 border border-white/30 shadow-2xl max-w-md w-full text-center">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-8 animate-pulse">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            Achat réussi !
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Vos crédits ont été ajoutés à votre compte avec succès.
          </p>

          {/* Session Info */}
          {searchParams.get('session_id') && (
            <div className="bg-gray-50 rounded-xl p-4 mb-8">
              <p className="text-sm text-gray-500 mb-1">ID de transaction</p>
              <p className="text-xs font-mono text-gray-700 break-all">
                {searchParams.get('session_id')}
              </p>
            </div>
          )}

          {/* Countdown */}
          <div className="bg-green-50 rounded-xl p-6 mb-8">
            <p className="text-green-700 mb-2">
              Redirection automatique dans
            </p>
            <div className="text-3xl font-bold text-green-600">{countdown}s</div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => router.push('/home')}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-4 px-6 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
            >
              <Home className="h-5 w-5" />
              <span>Retour à l'accueil</span>
            </button>
            
            <button
              onClick={() => router.push('/insights')}
              className="w-full bg-white border-2 border-green-500 text-green-600 font-bold py-4 px-6 rounded-xl hover:bg-green-50 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <span>Utiliser mes crédits</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CreditsSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mb-4 mx-auto"></div>
          <p className="text-green-600 font-medium">Chargement...</p>
        </div>
      </div>
    }>
      <CreditsSuccessContent />
    </Suspense>
  )
} 