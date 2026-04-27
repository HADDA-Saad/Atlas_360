import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import PortalButton from './PortalButton'
import DeleteItineraryButton from './DeleteItineraryButton'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Account | Atlas 360',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tier, subscription_status')
    .eq('id', user.id)
    .single()

  const tier = profile?.tier || 'explorer'
  const status = profile?.subscription_status || 'none'
  
  // Fetch custom itineraries
  const { data: itineraries } = await supabase
    .from('user_itineraries')
    .select('id, title, is_public, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const getTierColor = (t: string) => {
    if (t === 'nomad') return 'bg-[#C1440E]/10 text-[#D4622E] border-[#C1440E]/20'
    if (t === 'elite') return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    return 'bg-[#8B7355]/15 text-[#BFA882] border-[#8B7355]/20' // explorer
  }

  const getStatusColor = (s: string) => {
    if (s === 'active') return 'bg-green-500/10 text-green-400 border-green-500/20'
    if (s === 'cancelled' || s === 'canceled') return 'bg-red-500/10 text-red-400 border-red-500/20'
    return 'bg-[#8B7355]/10 text-[#8B7355] border-[#8B7355]/20' // Free plan
  }

  const displayStatus = status === 'active' ? 'Active' : (status === 'cancelled' || status === 'canceled' ? 'Cancelled' : 'Free plan')

  return (
    <div className="min-h-screen bg-[#0F0D0A] flex flex-col items-center py-32 px-4 atlas-grain">
      <div className="w-full max-w-2xl bg-[#1A1610] border border-[#E8D5B7]/10 rounded-3xl p-8 md:p-12 shadow-xl">
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-semibold text-[#F0E6D8] mb-10">
          My Account
        </h1>

        <div className="space-y-8">
          <div className="pb-8 border-b border-[#E8D5B7]/5">
            <p className="text-[11px] uppercase tracking-widest text-[#8B7355] mb-2">Email address</p>
            <p className="text-[#F0E6D8] font-medium text-lg">{user.email}</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-[#8B7355] mb-3">Current Plan</p>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-[11px] font-bold uppercase tracking-widest rounded-full border ${getTierColor(tier)}`}>
                  {tier}
                </span>
                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border ${getStatusColor(status)}`}>
                  {displayStatus}
                </span>
              </div>
            </div>

            <div className="mt-2 sm:mt-0">
              {status === 'active' ? (
                <PortalButton />
              ) : (
                <Link 
                  href="/pricing"
                  className="inline-block px-6 py-2.5 rounded-lg bg-[#C1440E] text-white text-[11px] font-bold uppercase tracking-widest hover:bg-[#D4622E] transition-colors shadow-lg shadow-[#C1440E]/20"
                >
                  Upgrade plan
                </Link>
              )}
            </div>
          </div>
          
          {/* Custom Itineraries Section */}
          {tier === 'elite' && (
            <div className="pt-8 border-t border-[#E8D5B7]/5">
              <div className="flex items-center justify-between mb-6">
                <p className="text-[11px] uppercase tracking-widest text-[#8B7355]">My Custom Itineraries</p>
                <Link href="/compose" className="text-[10px] uppercase tracking-widest text-[#C1440E] hover:text-[#D4622E] font-semibold border border-[#C1440E]/30 px-3 py-1.5 rounded-md transition-colors">
                  + Create New
                </Link>
              </div>
              
              {itineraries && itineraries.length > 0 ? (
                <div className="space-y-4">
                  {itineraries.map((itinerary) => (
                    <div key={itinerary.id} className="bg-[#0F0D0A] border border-[#E8D5B7]/5 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-[family-name:var(--font-cormorant)] text-xl font-semibold text-[#F0E6D8] mb-1">{itinerary.title}</h3>
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-sm ${itinerary.is_public ? 'bg-blue-500/10 text-blue-400' : 'bg-gray-500/10 text-gray-400'}`}>
                            {itinerary.is_public ? 'Public' : 'Private'}
                          </span>
                          <span className="text-[11px] text-[#8B7355]">
                            Created {new Date(itinerary.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Link 
                          href={`/itinerary/${itinerary.id}`}
                          className="text-[10px] uppercase tracking-widest font-semibold text-[#F0E6D8] hover:text-[#C1440E] px-3 py-1.5 border border-white/10 rounded-md bg-white/5 transition-colors"
                        >
                          View
                        </Link>
                        <DeleteItineraryButton id={itinerary.id} title={itinerary.title} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-[#0F0D0A] rounded-xl border border-dashed border-[#E8D5B7]/10">
                  <p className="text-[13px] text-[#8B7355] mb-4">You haven't created any custom itineraries yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
