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

  if (!sessionId) {
    redirect('/explore')
  }

  let session
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription.items'],
    })
  } catch (error) {
    redirect('/explore')
  }

  const tierName = session.metadata?.tier || 'Explorer'
  const capitalizedTier = tierName.charAt(0).toUpperCase() + tierName.slice(1)
  
  let nextBillingDate = ''
  if (session.subscription && typeof session.subscription !== 'string') {
    const firstItem = session.subscription.items?.data?.[0]
    if (firstItem) {
      const date = new Date(firstItem.current_period_end * 1000)
      nextBillingDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
    }
  }

  return (
    <div className="min-h-screen bg-[#0F0D0A] flex flex-col items-center justify-center p-4">
      <div className="bg-[#1A1610] border border-[#E8D5B7]/10 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C1440E] to-transparent opacity-50" />
        
        <div className="w-16 h-16 rounded-full bg-[#C1440E]/10 border border-[#C1440E]/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-[#C1440E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-[#F0E6D8] mb-2">
          Welcome to Atlas 360 {capitalizedTier}
        </h1>
        <p className="text-[14px] text-[#8B7355] mb-8">
          Your {capitalizedTier} plan is now active. 
          {nextBillingDate && <span className="block mt-1">Next billing date: {nextBillingDate}</span>}
        </p>

        <Link 
          href="/explore"
          className="inline-block w-full py-3.5 px-4 rounded-xl bg-[#C1440E] text-white text-[12px] font-bold uppercase tracking-widest hover:bg-[#D4622E] transition-colors shadow-lg shadow-[#C1440E]/20"
        >
          Start exploring →
        </Link>
      </div>
    </div>
  )
}
