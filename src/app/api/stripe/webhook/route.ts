import { logger } from '@/lib/logger'
import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')!
    
    let event: Stripe.Event
    
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (err) {
      logger.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      
      const userId = session.metadata?.userId
      const pack = session.metadata?.pack
      const credits = parseInt(session.metadata?.credits || '0')
      
      if (!userId || !pack || !credits) {
        logger.error('Missing metadata in session:', session.id)
        return NextResponse.json(
          { error: 'Missing metadata' },
          { status: 400 }
        )
      }
      
      // Use service role client to bypass RLS
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      
      // Insert purchase record
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
        logger.error('Error inserting purchase:', insertError)
        return NextResponse.json(
          { error: 'Database error' },
          { status: 500 }
        )
      }
      
      // Add credits to user profile
      const { error: creditsError } = await supabase
        .rpc('add_credits_to_user', {
          user_uuid: userId,
          credit_amount: credits
        })
      
      if (creditsError) {
        logger.error('Error adding credits:', creditsError)
        return NextResponse.json(
          { error: 'Credits update error' },
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