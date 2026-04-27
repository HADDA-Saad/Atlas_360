import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-04-22.dahlia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      console.error('Webhook Error: No signature found')
      return new Response(JSON.stringify({ error: 'No signature found' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`)
      return new Response(JSON.stringify({ error: 'Webhook Error' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Initialize Supabase Admin Client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )

    // Handle the specific events
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      const userId = session.client_reference_id
      const customerId = session.customer as string
      const amountTotal = session.amount_total

      // Safely read the exact tier they purchased from the metadata we attached during checkout
      // (This prevents bugs if Stripe prorates the price or applies a discount code)
      const tier = session.metadata?.tier || 'nomad'

      if (userId && customerId) {
        const { error } = await supabaseAdmin
          .from('profiles')
          .update({
            tier: tier,
            stripe_customer_id: customerId,
            subscription_status: 'active',
          })
          .eq('id', userId)

        if (error) {
          console.error('Error updating profile in Supabase on checkout completed:', error)
          return new Response(JSON.stringify({ error: 'Database Update Failed' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
        
        console.log(`Successfully upgraded user ${userId} to ${tier} tier.`)
      } else {
        console.error('Missing userId or customerId in checkout session:', { userId, customerId })
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      if (customerId) {
        const { error } = await supabaseAdmin
          .from('profiles')
          .update({
            tier: 'explorer',
            subscription_status: 'cancelled',
          })
          .eq('stripe_customer_id', customerId)

        if (error) {
          console.error('Error downgrading profile on subscription deleted:', error)
          return new Response(JSON.stringify({ error: 'Database Update Failed' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
        
        console.log(`Successfully downgraded customer ${customerId} to explorer.`)
      } else {
        console.error('Missing customerId in subscription deleted event.')
      }
    }

    // Return a 200 response for all successfully handled and unhandled events
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    console.error('Webhook handler failed:', error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
