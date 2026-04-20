import { createClient } from '@/lib/supabase/server'
import MapProvider from '@/components/MapProvider'
import type { Itinerary } from '@/types'

export default async function Home() {
  // Fetch itineraries server-side
  let itineraries: Itinerary[] = []

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('itineraries')
      .select('*')
      .order('created_at', { ascending: true })

    if (!error && data) {
      itineraries = data as Itinerary[]
    }
  } catch {
    // If Supabase is not configured yet, proceed with empty data
    console.warn('Supabase not configured or unreachable. Using empty itinerary list.')
  }

  return <MapProvider itineraries={itineraries} />
}
