import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ReviewPanel from '@/components/reviews/ReviewPanel'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const admin = createAdminClient()
  const [{ data: guide }, { data: profile }] = await Promise.all([
    admin.from('guides').select('rating').eq('id', id).single(),
    admin.from('profiles').select('full_name').eq('id', id).single(),
  ])
  const name = profile?.full_name ?? 'Local Guide'
  if (!guide) return { title: 'Guide Not Found | Atlas 360' }
  return {
    title: `${name} — Verified Guide | Atlas 360`,
    description: `Book ${name}, a certified local expert on Atlas 360.`,
  }
}

function StatRow({
  completedTrips, rating, reviewCount, responseRate, memberSince,
}: {
  completedTrips: number
  rating: number | null
  reviewCount: number
  responseRate: number | null
  memberSince: number | null
}) {
  const hasActivity = completedTrips > 0 || reviewCount > 0 || rating !== null
  if (!hasActivity) {
    return (
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
        New guide
      </span>
    )
  }

  const parts: string[] = []
  if (completedTrips > 0) parts.push(`${completedTrips} trip${completedTrips === 1 ? '' : 's'}`)
  if (rating !== null) {
    parts.push(reviewCount > 0
      ? `${rating.toFixed(1)} ★ (${reviewCount} review${reviewCount === 1 ? '' : 's'})`
      : `${rating.toFixed(1)} ★`)
  } else if (reviewCount > 0) {
    parts.push(`${reviewCount} review${reviewCount === 1 ? '' : 's'}`)
  }
  if (responseRate !== null && responseRate > 0) parts.push(`${responseRate}% response rate`)
  if (memberSince) parts.push(`Since ${memberSince}`)

  return (
    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80">
      {parts.join(' · ')}
    </span>
  )
}

export default async function GuideProfilePage({ params }: Props) {
  const { id } = await params
  const admin = createAdminClient()
  const supabase = await createClient()

  const [
    { data: guide },
    { data: profile },
    { data: bookingRows },
    { data: reviewRows },
    { data: { user } },
  ] = await Promise.all([
    admin.from('guides').select('*').eq('id', id).eq('is_verified', true).single(),
    admin.from('profiles').select('full_name, created_at').eq('id', id).single(),
    admin.from('guide_bookings').select('status').eq('guide_id', id),
    admin.from('reviews').select('id').eq('guide_id', id).eq('target_type', 'guide').eq('status', 'published'),
    supabase.auth.getUser(),
  ])

  if (!guide) notFound()

  const guideName    = profile?.full_name ?? 'Local Guide'
  const memberSince  = profile?.created_at ? new Date(profile.created_at).getFullYear() : null
  const allBookings  = bookingRows ?? []
  const completedTrips = allBookings.filter((b: any) => b.status === 'completed').length
  const responded      = allBookings.filter((b: any) => ['accepted', 'declined'].includes(b.status)).length
  const responseRate   = allBookings.length > 0 ? Math.round((responded / allBookings.length) * 100) : null
  const reviewCount    = (reviewRows ?? []).length

  // Check if current user has a completed booking
  let hasCompletedBooking = false
  if (user) {
    const { data: booking } = await supabase
      .from('guide_bookings')
      .select('id')
      .eq('traveler_id', user.id)
      .eq('guide_id', id)
      .eq('status', 'completed')
      .limit(1)
      .maybeSingle()
    hasCompletedBooking = Boolean(booking)
  }

  return (
    <div className="min-h-screen bg-background atlas-grain py-28 px-4">
      <div className="max-w-3xl mx-auto">

        <Link
          href="/guides"
          className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          ← All Guides
        </Link>

        {/* Hero card */}
        <div className="rounded-2xl border border-border bg-card/50 p-7 mb-6 flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xl uppercase flex-shrink-0 shadow-inner">
            {guideName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-semibold text-foreground tracking-tight">
                {guideName}
              </h1>
              <span className="text-sm text-green-400 font-semibold" title="Verified Expert">✓ Verified</span>
            </div>

            {/* Daily rate */}
            <p className="text-sm text-primary font-semibold font-mono mt-1">{guide.daily_rate_mad} MAD / day</p>

            {/* Trust stats row */}
            <div className="mt-2">
              <StatRow
                completedTrips={completedTrips}
                rating={guide.rating}
                reviewCount={reviewCount}
                responseRate={responseRate}
                memberSince={memberSince}
              />
            </div>

            {guide.bio && (
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {guide.bio}
              </p>
            )}
          </div>
        </div>

        {/* Stat tiles — always shown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="rounded-xl border border-border bg-card/30 p-4 text-center">
            <p className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-foreground">
              {completedTrips}
            </p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">Trips done</p>
          </div>
          <div className="rounded-xl border border-border bg-card/30 p-4 text-center">
            <p className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-foreground">
              {guide.rating != null ? guide.rating.toFixed(1) : '—'}
            </p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">Avg rating</p>
          </div>
          <div className="rounded-xl border border-border bg-card/30 p-4 text-center">
            <p className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-foreground">
              {reviewCount}
            </p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">Reviews</p>
          </div>
          <div className="rounded-xl border border-border bg-card/30 p-4 text-center">
            <p className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-foreground">
              {responseRate !== null ? `${responseRate}%` : '—'}
            </p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">Response rate</p>
          </div>
        </div>

        {/* Languages + Regions */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {guide.languages?.length > 0 && (
            <div className="rounded-xl border border-border bg-card/30 p-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2.5">Languages</h3>
              <div className="flex flex-wrap gap-1.5">
                {(guide.languages as string[]).map(lang => (
                  <span key={lang} className="px-2 py-0.5 rounded-full bg-muted border border-border/40 text-muted-foreground text-[10px] tracking-wide">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}
          {guide.regions?.length > 0 && (
            <div className="rounded-xl border border-border bg-card/30 p-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2.5">Regions Covered</h3>
              <div className="flex flex-wrap gap-1.5">
                {(guide.regions as string[]).map(reg => (
                  <span key={reg} className="px-2.5 py-0.5 rounded bg-primary/5 text-primary text-[10px] font-semibold border border-primary/10">
                    {reg}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Book CTA */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Ready to book {guideName}?</p>
            <p className="text-xs text-muted-foreground mt-0.5">Browse availability and submit a request in minutes.</p>
          </div>
          <Link
            href="/guides"
            className="flex-shrink-0 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-sm shadow-primary/10"
          >
            Book This Guide →
          </Link>
        </div>

        {/* Reviews */}
        <ReviewPanel
          targetType="guide"
          guideId={id}
          title={`Reviews for ${guideName}`}
        />

        {hasCompletedBooking && (
          <p className="mt-3 text-[11px] text-muted-foreground text-center">
            You&apos;ve completed a trip with {guideName} — leave your review in the form above.
          </p>
        )}

      </div>
    </div>
  )
}
