import Stripe from 'stripe'
import Link from 'next/link'
import { redirect } from 'next/navigation'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-04-22.dahlia',
})

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  const sessionId = resolvedParams.session_id as string | undefined
  const bookingId = resolvedParams.booking_id as string | undefined

  if (!sessionId) {
    redirect('/explore')
  }

  // Booking payment success
  if (bookingId) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="bg-card border border-border rounded-3xl p-10 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C1440E] to-transparent opacity-50" />

          <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-foreground mb-2">
            Booking Confirmed
          </h1>
          <p className="text-[14px] text-muted-foreground mb-8">
            Your payment was successful. You can now message your guide and prepare for your trip.
          </p>

          <Link
            href="/dashboard"
            className="inline-block w-full py-3.5 px-4 rounded-xl bg-primary text-primary-foreground text-[12px] font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            Go to my bookings →
          </Link>
        </div>
      </div>
    )
  }

  // Subscription success
  let session
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription.items'],
    })
  } catch {
    redirect('/explore')
  }

  const tierName = session.metadata?.tier || 'Explorer'
  const capitalizedTier = tierName.charAt(0).toUpperCase() + tierName.slice(1)

  let nextBillingDate = ''
  if (session.subscription && typeof session.subscription !== 'string') {
    const subscription = session.subscription as Stripe.Subscription & { current_period_end?: number }
    if (subscription.current_period_end) {
      const date = new Date(subscription.current_period_end * 1000)
      nextBillingDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="bg-card border border-border rounded-3xl p-10 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C1440E] to-transparent opacity-50" />

        <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-foreground mb-2">
          Welcome to Atlas 360 {capitalizedTier}
        </h1>
        <p className="text-[14px] text-muted-foreground mb-8">
          Your {capitalizedTier} plan is now active.
          {nextBillingDate && <span className="block mt-1">Next billing date: {nextBillingDate}</span>}
        </p>

        <Link
          href="/explore"
          className="inline-block w-full py-3.5 px-4 rounded-xl bg-primary text-primary-foreground text-[12px] font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
        >
          Start exploring →
        </Link>
      </div>
    </div>
  )
}
