import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

// Initialize Stripe (requires STRIPE_SECRET_KEY in .env.local)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-04-22.dahlia',
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    
    // Get the logged-in user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })
    }

    const body = await req.json()
    const { tier } = body

    if (!tier || (tier !== 'nomad' && tier !== 'elite')) {
      return NextResponse.json({ error: 'Invalid tier requested.' }, { status: 400 })
    }

    // Configure dynamic price data instead of requiring .env Price IDs
    let unitAmount = 0
    let productName = ''

    if (tier === 'elite') {
      unitAmount = 19900 // 199 MAD (Stripe expects amount in the smallest currency unit: cents/centimes)
      productName = 'Atlas 360 — Elite Tier'
    } else {
      unitAmount = 9900 // 99 MAD
      productName = 'Atlas 360 — Nomad Tier'
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Create a Stripe Checkout Session for a monthly subscription
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'mad',
            product_data: {
              name: productName,
            },
            unit_amount: unitAmount,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      client_reference_id: user.id, // Securely link this session to our Supabase user
      metadata: {
        userId: user.id,
        tier: tier,
      },
      customer_email: user.email,
      success_url: `${appUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing?canceled=true`,
    })

    return NextResponse.json({ url: session.url })

  } catch (error: any) {
    console.error('Stripe Checkout Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
