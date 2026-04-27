import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ComposerClient from './ComposerClient'
import type { Location } from '@/types'

export const dynamic = 'force-dynamic'

export default async function ComposePage() {
  const supabase = await createClient()

  // 1. Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  // 2. Tier check
  const { data: profile } = await supabase
    .from('profiles')
    .select('tier')
    .eq('id', user.id)
    .single()

  if (!profile || profile.tier !== 'elite') {
    return (
      <div className="min-h-screen bg-[#0F0D0A] flex flex-col items-center justify-center p-6 pt-24 atlas-grain text-center">
        <div className="w-16 h-16 rounded-full bg-[#1A1610] border border-[#E8D5B7]/10 flex items-center justify-center mb-6 shadow-xl">
          <svg className="w-8 h-8 text-[#C1440E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </div>
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-semibold text-[#F0E6D8] mb-4">
          Elite Feature
        </h1>
        <p className="text-[15px] text-[#8B7355] max-w-md mx-auto mb-8 leading-relaxed">
          The composer is an Elite feature. Upgrade to unlock the ability to build your own custom itineraries across Morocco.
        </p>
        <Link 
          href="/pricing"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#C1440E] hover:bg-[#D4622E] text-white text-[12px] font-semibold uppercase tracking-widest transition-colors shadow-lg shadow-[#C1440E]/20"
        >
          Upgrade to Elite →
        </Link>
      </div>
    )
  }

  // Fetch all locations (stops) and itineraries (for grouping)
  const { data: locationsData } = await supabase
    .from('locations')
    .select('*, itineraries(title)')
    .order('order_index', { ascending: true })
    
  const locations = locationsData || []

  return <ComposerClient initialLocations={locations} />
}
