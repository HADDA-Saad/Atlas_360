import HeroSection from '@/components/landing/HeroSection'
import HeritageSection from '@/components/landing/HeritageSection'
import CuratedJourneysSection from '@/components/landing/CuratedJourneysSection'
import { createClient } from '@/lib/supabase/server'

export default async function LandingPage() {
  let itineraries = []
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('itineraries')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(3)
    
    if (data) {
      itineraries = data
    }
  } catch (error) {
    console.warn('Failed to fetch itineraries:', error)
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0F0D0A] overflow-x-hidden">
      <HeroSection />
      <HeritageSection />
      <CuratedJourneysSection itineraries={itineraries} />
    </div>
  )
}
