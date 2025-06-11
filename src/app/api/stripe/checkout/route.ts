import { logger } from '@/lib/logger'
import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Vérifier si Stripe est configuré
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠️ STRIPE_SECRET_KEY not configured. Credit purchases will be disabled.')
}

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null

export async function POST(req: Request) {
  console.log('🔍 [Stripe API] Début de la requête POST')
  
  // Vérifier si Stripe est configuré
  if (!stripe || !process.env.STRIPE_SECRET_KEY) {
    console.log('❌ [Stripe API] Stripe non configuré')
    return NextResponse.json({ 
      error: 'Stripe non configuré',
      message: 'L\'API Stripe n\'est pas encore configurée. Veuillez configurer vos clés Stripe dans les variables d\'environnement.'
    }, { status: 503 })
  }

  try {
    const { pack } = await req.json()
    console.log(`🎁 [Stripe API] Pack demandé: ${pack}`)
    
    // Créer le client Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // Récupérer les cookies d'authentification
    const cookieStore = await cookies()
    
    // Essayer plusieurs formats de cookies Supabase possibles
    const possibleCookies = [
      'sb-xrvafxvowvoxpxcefktx-auth-token',
      'sb-xrvafxvowvoxpxcefktx-auth-token.0',
      'sb-xrvafxvowvoxpxcefktx-auth-token.1'
    ]
    
    let authCookie = null
    for (const cookieName of possibleCookies) {
      const cookie = cookieStore.get(cookieName)
      if (cookie && cookie.value) {
        authCookie = cookie
        console.log(`🍪 [Stripe API] Cookie trouvé: ${cookieName}`)
        break
      }
    }
    
    console.log(`🍪 [Stripe API] Cookie auth présent: ${authCookie ? 'oui' : 'non'}`)
    
    if (authCookie && authCookie.value) {
      console.log(`🔍 [Stripe API] Tentative auth via cookie: ${authCookie.value.substring(0, 50)}...`)
      
      try {
        // Essayer d'abord avec getUser() 
        const { data: { user }, error: getUserError } = await supabase.auth.getUser(authCookie.value)
        console.log(`👤 [Stripe API] Utilisateur via cookie: ${user ? user.id : 'non trouvé'}`)
        
        if (user) {
          return await createStripeSession(pack, user.id)
        }
        
        if (getUserError) {
          console.log('⚠️ [Stripe API] Erreur getUser:', getUserError.message)
        }
      } catch (cookieError) {
        console.log('⚠️ [Stripe API] Erreur parsing cookie:', cookieError)
      }
    }
    
    // Fallback: essayer via les headers Authorization
    const authHeader = req.headers.get('authorization')
    console.log(`🔑 [Stripe API] Header Authorization présent: ${authHeader ? 'oui' : 'non'}`)
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      console.log(`🔍 [Stripe API] Tentative auth via Bearer: ${token.substring(0, 50)}...`)
      
      try {
        const { data: { user }, error: bearerError } = await supabase.auth.getUser(token)
        console.log(`👤 [Stripe API] Utilisateur via Bearer: ${user ? user.id : 'non trouvé'}`)
        
        if (user) {
          return await createStripeSession(pack, user.id)
        }
        
        if (bearerError) {
          console.log('⚠️ [Stripe API] Erreur Bearer token:', bearerError.message)
        }
      } catch (bearerError) {
        console.log('⚠️ [Stripe API] Exception Bearer token:', bearerError)
      }
    }
    
    // Dernière tentative : essayer de récupérer la session via les cookies de session  
    console.log('🔄 [Stripe API] Tentative via session Supabase...')
    try {
      const { data: { user }, error: sessionError } = await supabase.auth.getUser()
      console.log(`👤 [Stripe API] Utilisateur via session: ${user ? user.id : 'non trouvé'}`)
      
      if (user) {
        return await createStripeSession(pack, user.id)
      }
      
      if (sessionError) {
        console.log('⚠️ [Stripe API] Erreur session:', sessionError.message)
      }
    } catch (sessionError) {
      console.log('⚠️ [Stripe API] Exception session:', sessionError)
    }
    
    console.log('❌ [Stripe API] Utilisateur non authentifié - aucune méthode n\'a fonctionné')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
  } catch (error) {
    console.log('❌ [Stripe API] Erreur:', error)
    logger.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function createStripeSession(pack: string, userId: string) {
  console.log(`💰 [Stripe API] Création session pour utilisateur: ${userId}`)
  
  // Pack configuration avec prix en centimes USD
  const packs = {
    pack_50: { 
      credits: 50, 
      price: 499, // $4.99 en centimes
      priceId: process.env.STRIPE_PRICE_PACK_50 
    },
    pack_150: { 
      credits: 150, 
      price: 1199, // $11.99 en centimes
      priceId: process.env.STRIPE_PRICE_PACK_150 
    },
    pack_500: { 
      credits: 500, 
      price: 2999, // $29.99 en centimes
      priceId: process.env.STRIPE_PRICE_PACK_500 
    }
  }
  
  const selectedPack = packs[pack as keyof typeof packs]
  if (!selectedPack) {
    console.log(`❌ [Stripe API] Pack invalide: ${pack}`)
    return NextResponse.json({ error: 'Invalid pack' }, { status: 400 })
  }

  console.log(`💰 [Stripe API] Pack sélectionné: ${selectedPack.credits} crédits, $${selectedPack.price/100}`)

  // Si pas de priceId configuré, créer la session avec un prix dynamique
  const lineItems = selectedPack.priceId ? [
    {
      price: selectedPack.priceId,
      quantity: 1
    }
  ] : [
    {
      price_data: {
        currency: 'usd',
        product_data: {
          name: `Pack de ${selectedPack.credits} crédits`,
          description: `Achetez ${selectedPack.credits} crédits pour vos analyses IA`
        },
        unit_amount: selectedPack.price
      },
      quantity: 1
    }
  ]
  
  console.log(`🛒 [Stripe API] Création de session Stripe...`)
  
  const session = await stripe!.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: lineItems,
    metadata: {
      userId: userId,
      pack: pack,
      credits: selectedPack.credits.toString()
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/credits/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/credits`
  })
  
  console.log(`✅ [Stripe API] Session créée: ${session.id}`)
  console.log(`🔗 [Stripe API] URL: ${session.url}`)
  
  return NextResponse.json({ url: session.url })
} 