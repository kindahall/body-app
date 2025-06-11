import { logger } from '@/lib/logger'
import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  console.log('🎣 [Webhook] Début traitement webhook Stripe')
  
  try {
    const body = await req.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')
    
    console.log('🎣 [Webhook] Signature présente:', signature ? 'oui' : 'non')
    
    let event: Stripe.Event
    
    // En mode développement, permettre les webhooks sans signature pour les tests
    if (process.env.NODE_ENV === 'development' && !signature) {
      console.log('🎣 [Webhook] Mode développement - parsing direct du body')
      try {
        event = JSON.parse(body)
      } catch (parseError) {
        console.error('❌ [Webhook] Erreur parsing JSON:', parseError)
        return NextResponse.json(
          { error: 'Invalid JSON' },
          { status: 400 }
        )
      }
    } else {
      // Mode production ou signature présente
      if (!process.env.STRIPE_WEBHOOK_SECRET) {
        console.log('⚠️ [Webhook] STRIPE_WEBHOOK_SECRET manquant')
        return NextResponse.json(
          { error: 'Webhook secret not configured' },
          { status: 500 }
        )
      }
      
      try {
        event = stripe.webhooks.constructEvent(
          body,
          signature!,
          process.env.STRIPE_WEBHOOK_SECRET!
        )
        console.log('✅ [Webhook] Signature vérifiée')
      } catch (err) {
        console.error('❌ [Webhook] Erreur vérification signature:', err)
        logger.error('Webhook signature verification failed:', err)
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 400 }
        )
      }
    }
    
    console.log('🎣 [Webhook] Type d\'événement:', event.type)
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      
      console.log('💳 [Webhook] Session checkout complétée:', session.id)
      
      const userId = session.metadata?.userId
      const pack = session.metadata?.pack
      const credits = parseInt(session.metadata?.credits || '0')
      
      console.log('📊 [Webhook] Métadonnées:', { userId, pack, credits })
      
      if (!userId || !pack || !credits) {
        console.error('❌ [Webhook] Métadonnées manquantes:', session.metadata)
        logger.error('Missing metadata in session:', session.id)
        return NextResponse.json(
          { error: 'Missing metadata' },
          { status: 400 }
        )
      }
      
      // Use service role client to bypass RLS
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (!serviceKey) {
        console.log('⚠️ [Webhook] Utilisation de la clé anonyme (mode test)')
      }
      
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      console.log('🗄️ [Webhook] Tentative d\'insertion historique achat...')
      
      // Insert purchase record (optionnel si table n'existe pas)
      try {
        const { error: insertError } = await supabase
          .from('credit_purchases')
          .insert({
            user_id: userId,
            stripe_session_id: session.id,
            pack_type: pack,
            credits: credits,
            amount_cents: session.amount_total || 0
          })
        
        if (insertError) {
          console.warn('⚠️ [Webhook] Historique non créé (table credit_purchases inexistante):', insertError.message)
        } else {
          console.log('📝 [Webhook] Historique créé')
        }
      } catch (historyError) {
        console.warn('⚠️ [Webhook] Erreur historique (ignorée):', historyError)
      }
      
      console.log('💰 [Webhook] Ajout des crédits...')
      
      // Add credits to user profile using simple update
      try {
        // D'abord essayer avec RPC function
        const { error: rpcError } = await supabase
          .rpc('add_credits', {
            amount: credits,
            user_uuid: userId
          })
        
        if (rpcError) {
          console.log('⚠️ [Webhook] RPC add_credits échoué, tentative UPDATE direct')
          
          // Fallback: UPDATE direct
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ credits: supabase.rpc('get_user_credits', { user_uuid: userId }).then(r => (r.data || 0) + credits) })
            .eq('id', userId)
          
          if (updateError) {
            console.error('❌ [Webhook] Echec UPDATE profiles:', updateError)
            throw updateError
          }
        }
        
        console.log(`✅ [Webhook] ${credits} crédits ajoutés à l'utilisateur ${userId}`)
        
      } catch (creditsError) {
        console.error('❌ [Webhook] Erreur ajout crédits:', creditsError)
        logger.error('Error adding credits:', creditsError)
        return NextResponse.json(
          { error: 'Credits update error', details: creditsError instanceof Error ? creditsError.message : 'Unknown error' },
          { status: 500 }
        )
      }
      
      logger.debug(`Successfully added ${credits} credits to user ${userId}`)
    }
    
    return NextResponse.json({ received: true })
    
  } catch (error) {
    logger.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 