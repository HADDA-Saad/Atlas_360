import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import type { UserTier } from '@/types'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-04-22.dahlia',
})

type CheckoutTier = Exclude<UserTier, 'explorer'>

interface CheckoutBody {
  tier?: unknown
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Internal Server Error'
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })
    }

    const body = await req.json() as CheckoutBody
    const { tier } = body

    if (tier !== 'nomad' && tier !== 'elite') {
      return NextResponse.json({ error: 'Invalid tier requested.' }, { status: 400 })
    }

    const requestedTier = tier as CheckoutTier

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    const configuredPriceId = requestedTier === 'elite'
      ? process.env.STRIPE_ELITE_PRICE_ID
      : process.env.STRIPE_NOMAD_PRICE_ID

    const lineItem = configuredPriceId
      ? { price: configuredPriceId, quantity: 1 }
      : {
          price_data: {
            currency: 'mad',
            product_data: {
              name: requestedTier === 'elite'
                ? 'Atlas 360 - Elite Tier'
                : 'Atlas 360 - Nomad Tier',
            },
            unit_amount: requestedTier === 'elite' ? 19900 : 9900,
            recurring: {
              interval: 'month' as const,
            },
          },
          quantity: 1,
        }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [lineItem],
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
        tier: requestedTier,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          tier: requestedTier,
        },
      },
      ...(profile?.stripe_customer_id
        ? { customer: profile.stripe_customer_id }
        : { customer_email: user.email }),
      success_url: `${appUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing?canceled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: unknown) {
    console.error('Stripe Checkout Error:', error)
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}
