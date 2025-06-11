'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/AuthHandlerMCP'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CreditCard, Zap, Gift, Crown, Sparkles } from 'lucide-react'
import { createClientComponentClient } from '@/lib/supabase'

export default function CreditsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [credits, setCredits] = useState(0)
  const [mounted, setMounted] = useState(false)
  const supabase = createClientComponentClient()

  // Fix hydratation mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const packs = [
    {
      id: 'pack_50',
      name: 'Petit Pack',
      credits: 50,
      price: '$4.99',
      description: 'Parfait pour débuter',
      icon: Zap,
      color: 'from-blue-400 to-blue-600',
      popular: false
    },
    {
      id: 'pack_150',
      name: 'Moyen Pack',
      credits: 150,
      price: '$11.99',
      description: 'Le plus populaire',
      icon: Crown,
      color: 'from-purple-400 to-purple-600',
      popular: true
    },
    {
      id: 'pack_500',
      name: 'Grand Pack',
      credits: 500,
      price: '$29.99',
      description: 'Maximum de valeur',
      icon: Sparkles,
      color: 'from-yellow-400 to-orange-600',
      popular: false
    }
  ]

  useEffect(() => {
    if (user) {
      fetchCredits()
    }
  }, [user])

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

  const buyCredits = async (packId: string) => {
    console.log('🛒 [Frontend] Début achat crédits:', packId)
    
    if (!mounted) {
      console.log('🔄 [Frontend] Composant non encore monté, ignoré')
      return
    }
    
    if (!user) {
      console.log('❌ [Frontend] Utilisateur non connecté, redirection vers auth')
      alert('Vous devez être connecté pour acheter des crédits.')
      router.push('/auth')
      return
    }

    console.log('👤 [Frontend] Utilisateur connecté:', user.id)
    setLoading(packId)
    
    try {
      console.log('🌐 [Frontend] Envoi requête vers API Stripe...')
      
      // Récupérer le token de session actuel
      const { data: { session } } = await supabase.auth.getSession()
      console.log('🔑 [Frontend] Session récupérée:', session ? 'oui' : 'non')
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      // Ajouter le token d'autorisation si disponible
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
        console.log('🔐 [Frontend] Token ajouté au header Authorization')
      }
      
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers,
        body: JSON.stringify({ pack: packId })
      })
      
      console.log('📡 [Frontend] Réponse reçue, status:', response.status)
      
      const data = await response.json()
      console.log('📄 [Frontend] Données reçues:', data)
      
      const { url, error, message } = data
      
      if (error) {
        console.error('❌ [Frontend] Erreur API:', { error, message, status: response.status })
        
        if (response.status === 503) {
          // Stripe non configuré
          alert(`⚠️ ${message}\n\nLe système de paiement n'est pas encore configuré. Contactez l'administrateur.`)
        } else if (response.status === 401) {
          alert('Vous devez être connecté pour acheter des crédits.')
          router.push('/auth')
        } else {
          console.error('Checkout error:', error)
          alert(`Erreur lors de la création du paiement: ${error}\nDétails: ${data.details || 'Aucun détail disponible'}`)
        }
        return
      }
      
      if (url) {
        console.log('🔗 [Frontend] Redirection vers Stripe:', url)
        window.location.href = url
      } else {
        console.error('❌ [Frontend] Pas d\'URL de redirection reçue')
        alert('Erreur: Pas d\'URL de paiement reçue.')
      }
      
    } catch (error) {
      console.error('❌ [Frontend] Erreur réseau:', error)
      alert('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setLoading(null)
    }
  }

  // Debug: Afficher l'état en développement
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la page des crédits...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Debug Info - Visible seulement en dev */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-20 right-4 bg-black/80 text-white p-3 rounded-lg text-xs z-50">
          <div>🟢 Mounted: {mounted ? 'true' : 'false'}</div>
          <div>👤 User: {user ? user.id.substring(0, 8) + '...' : 'null'}</div>
          <div>💰 Credits: {credits}</div>
        </div>
      )}
      
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
        <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-20 right-20 w-32 h-32 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-32 h-32 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse animation-delay-1000"></div>
      </div>

      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <button
              onClick={() => router.push('/settings')}
              className="group flex items-center space-x-3 text-gray-600 hover:text-yellow-600 transition-all duration-300 p-2 rounded-xl hover:bg-white/50"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Retour</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 p-3 rounded-2xl shadow-lg animate-pulse">
                <CreditCard className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  Crédits
                </h1>
                <p className="text-sm text-gray-500">Achetez des crédits pour vos analyses IA</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-xl shadow-lg">
              <div className="text-center">
                <div className="text-xl font-bold">{credits}</div>
                <div className="text-xs opacity-90">crédits</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mb-6 animate-pulse">
            <Gift className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-4">
            Système de Crédits
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Utilisez vos crédits pour générer des analyses IA personnalisées. 
            Recevez <strong>+1 crédit gratuit</strong> chaque jour !
          </p>
        </div>

        {/* Credit Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-lg text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">1 Analyse IA</h3>
            <p className="text-gray-600">= 10 crédits</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-lg text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Bonus Quotidien</h3>
            <p className="text-gray-600">+1 crédit gratuit/jour</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-lg text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Pas d'expiration</h3>
            <p className="text-gray-600">Vos crédits n'expirent jamais</p>
          </div>
        </div>

        {/* Credit Packs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packs.map((pack) => {
            const Icon = pack.icon
            return (
              <div
                key={pack.id}
                className={`relative bg-white/90 backdrop-blur-lg rounded-3xl p-8 border border-white/30 shadow-xl transform hover:scale-105 transition-all duration-300 ${
                  pack.popular ? 'ring-2 ring-purple-400' : ''
                }`}
              >
                {pack.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                      ⭐ Populaire
                    </span>
                  </div>
                )}
                
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r ${pack.color} rounded-2xl mb-6 shadow-lg`}>
                    <Icon className="h-10 w-10 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{pack.name}</h3>
                  <p className="text-gray-600 mb-4">{pack.description}</p>
                  
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-gray-800 mb-1">{pack.credits}</div>
                    <div className="text-sm text-gray-500">crédits</div>
                  </div>
                  
                  <div className="text-3xl font-bold text-gray-800 mb-6">{pack.price}</div>
                  
                  <button
                    onClick={(e) => {
                      console.log('🖱️ [Frontend] Clic sur le bouton pack:', pack.id)
                      console.log('🖱️ [Frontend] User state:', user ? user.id : 'null')
                      console.log('🖱️ [Frontend] Mounted state:', mounted)
                      e.preventDefault()
                      e.stopPropagation()
                      buyCredits(pack.id)
                    }}
                    disabled={loading === pack.id || !mounted}
                    className={`w-full bg-gradient-to-r ${pack.color} text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading === pack.id ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Redirection...</span>
                      </div>
                    ) : (
                      'Acheter maintenant'
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-white/30 shadow-xl">
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">Questions fréquentes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold text-gray-800 mb-2">💳 Paiement sécurisé</h4>
              <p className="text-gray-600">Tous les paiements sont traités de manière sécurisée par Stripe.</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2">⏰ Bonus quotidien</h4>
              <p className="text-gray-600">Recevez automatiquement 1 crédit gratuit chaque jour.</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2">🔄 Pas d'abonnement</h4>
              <p className="text-gray-600">Achat unique, pas de renouvellement automatique.</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2">♾️ Pas d'expiration</h4>
              <p className="text-gray-600">Vos crédits restent disponibles indéfiniment.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 