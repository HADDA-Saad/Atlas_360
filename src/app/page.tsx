import HeroSection from '@/components/landing/HeroSection'
import HeritageSection from '@/components/landing/HeritageSection'
import CuratedJourneysSection from '@/components/landing/CuratedJourneysSection'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0F0D0A] overflow-x-hidden">
      <HeroSection />
      <HeritageSection />
      <CuratedJourneysSection />
    </div>
  )
}
