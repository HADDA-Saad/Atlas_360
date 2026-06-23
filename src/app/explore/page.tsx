import { createClient } from '@/lib/supabase/server'
import MapProvider from '@/components/MapProvider'
import type { Itinerary, UserTier } from '@/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Explore Morocco | Atlas 360',
  description: "Discover immersive 360° itineraries across Morocco's most iconic destinations.",
  openGraph: {
    title: 'Explore Morocco | Atlas 360',
    description: "Discover immersive 360° itineraries across Morocco's most iconic destinations.",
  },
}

export default async function Home() {
  let itineraries: Itinerary[] = []
  let userTier: UserTier = 'explorer'

  try {
    const supabase = await createClient()

    const [itinerariesResult, userResult] = await Promise.all([
      supabase.from('itineraries').select('*').order('created_at', { ascending: true }),
      supabase.auth.getUser(),
    ])

    if (!itinerariesResult.error && itinerariesResult.data) {
      itineraries = itinerariesResult.data as Itinerary[]
    }

    if (userResult.data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('tier')
        .eq('id', userResult.data.user.id)
        .single()

      if (profile?.tier) {
        userTier = profile.tier as UserTier
      }
    }
  } catch {
    console.warn('Supabase not configured or unreachable. Using empty itinerary list.')
  }

  return <MapProvider itineraries={itineraries} userTier={userTier} />
}
