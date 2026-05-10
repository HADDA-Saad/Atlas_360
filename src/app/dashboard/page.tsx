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
    if (t === 'nomad') return 'bg-primary/10 text-[#D4622E] border-primary/20'
    if (t === 'elite') return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    return 'bg-muted-foreground/15 text-muted-foreground border-muted-foreground/20' // explorer
  }

  const getStatusColor = (s: string) => {
    if (s === 'active') return 'bg-green-500/10 text-green-400 border-green-500/20'
    if (s === 'cancelled' || s === 'canceled') return 'bg-red-500/10 text-red-400 border-red-500/20'
    return 'bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20' // Free plan
  }

  const displayStatus = status === 'active' ? 'Active' : (status === 'cancelled' || status === 'canceled' ? 'Cancelled' : 'Free plan')

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-32 px-4 atlas-grain">
      <div className="w-full max-w-2xl bg-card border border-border rounded-3xl p-8 md:p-12 shadow-xl">
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-semibold text-foreground mb-10">
          My Account
        </h1>

        <div className="space-y-8">
          <div className="pb-8 border-b border-border">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">Email address</p>
            <p className="text-foreground font-medium text-lg">{user.email}</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">Current Plan</p>
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
                  className="inline-block px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                  Upgrade plan
                </Link>
              )}
            </div>
          </div>
          
          {/* Custom Itineraries Section */}
          {tier === 'elite' && (
            <div className="pt-8 border-t border-border">
              <div className="flex items-center justify-between mb-6">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground">My Custom Itineraries</p>
                <Link href="/compose" className="text-[10px] uppercase tracking-widest text-primary hover:text-primary/80 font-semibold border border-primary/30 px-3 py-1.5 rounded-md transition-colors">
                  + Create New
                </Link>
              </div>
              
              {itineraries && itineraries.length > 0 ? (
                <div className="space-y-4">
                  {itineraries.map((itinerary) => (
                    <div key={itinerary.id} className="bg-background border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-[family-name:var(--font-cormorant)] text-xl font-semibold text-foreground mb-1">{itinerary.title}</h3>
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-sm ${itinerary.is_public ? 'bg-blue-500/10 text-blue-400' : 'bg-gray-500/10 text-gray-400'}`}>
                            {itinerary.is_public ? 'Public' : 'Private'}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            Created {new Date(itinerary.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Link 
                          href={`/itinerary/${itinerary.id}`}
                          className="text-[10px] uppercase tracking-widest font-semibold text-foreground hover:text-primary px-3 py-1.5 border border-border rounded-md bg-foreground/5 transition-colors"
                        >
                          View
                        </Link>
                        <DeleteItineraryButton id={itinerary.id} title={itinerary.title} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-background rounded-xl border border-dashed border-border">
                  <p className="text-[13px] text-muted-foreground mb-4">You haven&apos;t created any custom itineraries yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
