import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import type { UserTier } from '@/types'
import { setPaid } from '@/lib/setPaid'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-04-22.dahlia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''
const paidStatuses = new Set<Stripe.Subscription.Status>(['active', 'trialing'])

type PaidTier = Exclude<UserTier, 'explorer'>

function jsonResponse(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown error'
}

function getPaidTier(value: string | null | undefined): PaidTier {
  if (value === 'elite') return 'elite'
  return 'nomad'
}

function tierForSubscription(subscription: Stripe.Subscription): UserTier {
  return paidStatuses.has(subscription.status)
    ? getPaidTier(subscription.metadata?.tier)
    : 'explorer'
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      console.error('Webhook Error: No signature found')
      return jsonResponse({ error: 'No signature found' }, 400)
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (error: unknown) {
      console.error(`Webhook signature verification failed: ${getErrorMessage(error)}`)
      return jsonResponse({ error: 'Webhook Error' }, 400)
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const bookingId = session.metadata?.bookingId

      if (bookingId) {
        try {
          await setPaid(bookingId)
          console.log(`Successfully marked guide booking ${bookingId} as paid.`)
        } catch (err) {
          console.error('Error marking guide booking paid:', err)
          return jsonResponse({ error: 'Database Update Failed' }, 500)
        }
        return jsonResponse({ received: true }, 200)
      }

      const userId = session.client_reference_id
      const customerId = typeof session.customer === 'string' ? session.customer : null
      const tier = getPaidTier(session.metadata?.tier)

      if (!userId || !customerId) {
        console.error('Missing userId or customerId in checkout session:', { userId, customerId })
        return jsonResponse({ received: true }, 200)
      }

      // ── Subscription checkout (Nomad / Elite) ──
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({
          tier,
          stripe_customer_id: customerId,
          subscription_status: 'active',
        })
        .eq('id', userId)

      if (error) {
        console.error('Error updating profile in Supabase on checkout completed:', error)
        return jsonResponse({ error: 'Database Update Failed' }, 500)
      }

      console.log(`Successfully upgraded user ${userId} to ${tier} tier.`)
    } else if (
      event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.deleted'
    ) {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = typeof subscription.customer === 'string' ? subscription.customer : null

      if (!customerId) {
        console.error('Missing customerId in subscription event.')
        return jsonResponse({ received: true }, 200)
      }

      const { error } = await supabaseAdmin
        .from('profiles')
        .update({
          tier: event.type === 'customer.subscription.deleted'
            ? 'explorer'
            : tierForSubscription(subscription),
          subscription_status: event.type === 'customer.subscription.deleted'
            ? 'cancelled'
            : subscription.status,
        })
        .eq('stripe_customer_id', customerId)

      if (error) {
        console.error('Error updating profile on subscription event:', error)
        return jsonResponse({ error: 'Database Update Failed' }, 500)
      }
    } else if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = typeof invoice.customer === 'string' ? invoice.customer : null

      if (customerId) {
        const { error } = await supabaseAdmin
          .from('profiles')
          .update({
            tier: 'explorer',
            subscription_status: 'past_due',
          })
          .eq('stripe_customer_id', customerId)

        if (error) {
          console.error('Error marking profile past_due:', error)
          return jsonResponse({ error: 'Database Update Failed' }, 500)
        }
      }
    }

    return jsonResponse({ received: true }, 200)
  } catch (error: unknown) {
    console.error('Webhook handler failed:', error)
    return jsonResponse({ error: 'Internal Server Error' }, 500)
  }
}
