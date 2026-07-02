import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-04-22.dahlia',
})

interface CheckoutBody {
  tier?: unknown
  billing?: unknown
  bookingId?: unknown
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
    const { tier, billing, bookingId } = body

    if (bookingId) {
      if (typeof bookingId !== 'string') {
        return NextResponse.json({ error: 'Invalid bookingId.' }, { status: 400 })
      }

      const { data: booking, error: bookingError } = await supabase
        .from('guide_bookings')
        .select('*')
        .eq('id', bookingId)
        .eq('traveler_id', user.id)
        .single()

      if (bookingError || !booking) {
        return NextResponse.json({ error: 'Booking not found.' }, { status: 404 })
      }

      if (booking.status !== 'accepted') {
        return NextResponse.json({ error: 'Only accepted bookings can be paid.' }, { status: 400 })
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'mad',
              product_data: {
                name: 'Local Guide Booking - Atlas 360',
                description: `Tour Guide reservation from ${booking.start_date} to ${booking.end_date}`,
              },
              unit_amount: booking.total_price * 100,
            },
            quantity: 1,
          },
        ],
        client_reference_id: user.id,
        metadata: {
          userId: user.id,
          bookingId: booking.id,
        },
        customer_email: user.email,
        success_url: `${appUrl}/booking/success?booking_id=${booking.id}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/dashboard?canceled=true`,
      })

      return NextResponse.json({ url: session.url, sessionId: session.id })
    }

    if (tier !== 'nomad' && tier !== 'elite' && tier !== 'concierge') {
      return NextResponse.json({ error: 'Invalid tier requested.' }, { status: 400 })
    }

    const billingPeriod = billing === 'year' ? 'year' : 'month'
    const isYearly = billingPeriod === 'year'

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const configuredPriceId = tier === 'concierge'
      ? (isYearly ? process.env.STRIPE_CONCIERGE_YEARLY_PRICE_ID : process.env.STRIPE_CONCIERGE_PRICE_ID)
      : tier === 'elite'
        ? (isYearly ? process.env.STRIPE_ELITE_YEARLY_PRICE_ID : process.env.STRIPE_ELITE_PRICE_ID)
        : (isYearly ? process.env.STRIPE_NOMAD_YEARLY_PRICE_ID : process.env.STRIPE_NOMAD_PRICE_ID)

    const fallbackAmount = tier === 'concierge'
      ? (isYearly ? 1000000 : 100000)
      : tier === 'elite'
        ? (isYearly ? 199000 : 19900)
        : (isYearly ? 99000 : 9900)

    const lineItem = configuredPriceId
      ? { price: configuredPriceId, quantity: 1 }
      : {
          price_data: {
            currency: 'mad',
            product_data: {
              name: tier === 'concierge'
                ? 'Atlas 360 - Concierge Tier'
                : tier === 'elite'
                  ? 'Atlas 360 - Elite Tier'
                  : 'Atlas 360 - Nomad Tier',
            },
            unit_amount: fallbackAmount,
            recurring: {
              interval: billingPeriod as 'month' | 'year',
            },
          },
          quantity: 1,
        }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [lineItem],
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
        tier,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          tier,
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
