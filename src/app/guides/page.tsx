import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GuidesClient from './GuidesClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Local Tour Guides | Atlas 360',
  description: 'Book verified local tour guides for your Moroccan adventure.',
}

export default async function GuidesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/guides')
  }

  const { data: guidesData } = await supabase
    .from('guides')
    .select('*')
    .eq('is_verified', true)

  const guides = guidesData || []
  const guideIds = guides.map(g => g.id)

  // Parallel fetches for profiles + stats
  const [profilesRes, bookingsRes, reviewsRes] = await Promise.all([
    guideIds.length > 0
      ? supabase.from('profiles').select('id, full_name, avatar_url, created_at').in('id', guideIds)
      : Promise.resolve({ data: [] }),
    guideIds.length > 0
      ? supabase.from('guide_bookings').select('guide_id, status').in('guide_id', guideIds)
      : Promise.resolve({ data: [] }),
    guideIds.length > 0
      ? supabase.from('reviews').select('guide_id').eq('target_type', 'guide').eq('status', 'published').in('guide_id', guideIds)
      : Promise.resolve({ data: [] }),
  ])

  const profiles   = (profilesRes as any).data  || []
  const bookings   = (bookingsRes  as any).data  || []
  const reviewRows = (reviewsRes   as any).data  || []

  // Derive per-guide stats in JS (avoids complex DB views / RPC)
  const statsByGuide = new Map<string, {
    completedTrips: number
    responseRate: number | null
    reviewCount: number
    memberSince: number | null
  }>()

  for (const id of guideIds) {
    const gb = bookings.filter((b: any) => b.guide_id === id)
    const completedTrips = gb.filter((b: any) => b.status === 'completed').length
    const responded      = gb.filter((b: any) => ['accepted', 'declined'].includes(b.status)).length
    const responseRate   = gb.length > 0 ? Math.round((responded / gb.length) * 100) : null
    const reviewCount    = reviewRows.filter((r: any) => r.guide_id === id).length
    const profile        = profiles.find((p: any) => p.id === id)
    const memberSince    = profile?.created_at ? new Date(profile.created_at).getFullYear() : null
    statsByGuide.set(id, { completedTrips, responseRate, reviewCount, memberSince })
  }

  const guidesWithProfiles = guides.map(g => {
    const p     = profiles.find((prof: any) => prof.id === g.id)
    const stats = statsByGuide.get(g.id) ?? { completedTrips: 0, responseRate: null, reviewCount: 0, memberSince: null }
    return { ...g, full_name: p?.full_name ?? 'Local Guide', avatar_url: p?.avatar_url ?? null, ...stats }
  })

  let itineraries: any[] = []
  if (user) {
    const { data: itin } = await supabase
      .from('user_itineraries')
      .select('id, title')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    itineraries = itin || []
  }

  return <GuidesClient guides={guidesWithProfiles} itineraries={itineraries} user={user} />
}
