import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'

// API Stripe temporairement désactivée
export async function POST(req: Request) {
  return NextResponse.json({ 
    error: 'Stripe non configuré',
    message: 'L\'API Stripe n\'est pas encore configurée. Veuillez configurer vos clés Stripe dans les variables d\'environnement.'
  }, { status: 503 })
}

/* 
// Code original à réactiver quand Stripe sera configuré :

import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  try {
    const { pack } = await req.json()
    
    const cookieStore = await cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Pack configuration
    const packs = {
      pack_50: { credits: 50, price: 499, priceId: process.env.STRIPE_PRICE_PACK_50! },
      pack_150: { credits: 150, price: 1199, priceId: process.env.STRIPE_PRICE_PACK_150! },
      pack_500: { credits: 500, price: 2999, priceId: process.env.STRIPE_PRICE_PACK_500! }
    }
    
    const selectedPack = packs[pack as keyof typeof packs]
    if (!selectedPack) {
      return NextResponse.json({ error: 'Invalid pack' }, { status: 400 })
    }
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price: selectedPack.priceId,
          quantity: 1
        }
      ],
      metadata: {
        userId: user.id,
        pack: pack,
        credits: selectedPack.credits.toString()
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/credits/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/credits`
    })
    
    return NextResponse.json({ url: session.url })
    
  } catch (error) {
    logger.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
*/ 