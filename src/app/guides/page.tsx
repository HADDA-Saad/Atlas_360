import { createClient } from '@/lib/supabase/server'
import GuidesClient from './GuidesClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Local Tour Guides | Atlas 360',
  description: 'Book verified local tour guides for your Moroccan adventure.',
}

export default async function GuidesPage() {
  const supabase = await createClient()

  // Fetch verified guides
  const { data: guidesData } = await supabase
    .from('guides')
    .select('*')
    .eq('is_verified', true)

  const guides = guidesData || []

  // Fetch names of verified guides
  const guideIds = guides.map(g => g.id)
  let profiles: any[] = []
  if (guideIds.length > 0) {
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', guideIds)
    profiles = profilesData || []
  }

  const guidesWithProfiles = guides.map(g => {
    const p = profiles.find(prof => prof.id === g.id)
    return {
      ...g,
      full_name: p ? p.full_name : 'Local Guide'
    }
  })

  // Fetch user details and itineraries for booking
  const { data: { user } } = await supabase.auth.getUser()
  let itineraries: any[] = []
  if (user) {
    const { data: itinerariesData } = await supabase
      .from('user_itineraries')
      .select('id, title')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    itineraries = itinerariesData || []
  }

  return <GuidesClient guides={guidesWithProfiles} itineraries={itineraries} user={user} />
}
