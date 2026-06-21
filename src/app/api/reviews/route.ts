import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ReviewTargetType } from '@/types'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const TARGET_TYPES = new Set<ReviewTargetType>(['itinerary', 'location', 'guide'])

interface ReviewBody {
  target_type?: unknown
  itinerary_id?: unknown
  location_id?: unknown
  guide_id?: unknown
  rating?: unknown
  body?: unknown
}

function parseTarget(searchParams: URLSearchParams) {
  const targetType = searchParams.get('target_type') as ReviewTargetType | null
  if (!targetType || !TARGET_TYPES.has(targetType)) {
    return { error: 'Invalid target_type' }
  }

  const itineraryId = searchParams.get('itinerary_id')
  const locationId  = searchParams.get('location_id')
  const guideId     = searchParams.get('guide_id')

  if (targetType === 'itinerary') {
    if (!itineraryId || !UUID_REGEX.test(itineraryId) || locationId || guideId)
      return { error: 'A valid itinerary_id is required for itinerary reviews' }
    return { targetType, itineraryId, locationId: null, guideId: null }
  }

  if (targetType === 'location') {
    if (!locationId || !UUID_REGEX.test(locationId) || itineraryId || guideId)
      return { error: 'A valid location_id is required for location reviews' }
    return { targetType, itineraryId: null, locationId, guideId: null }
  }

  // guide
  if (!guideId || !UUID_REGEX.test(guideId) || itineraryId || locationId)
    return { error: 'A valid guide_id is required for guide reviews' }
  return { targetType, itineraryId: null, locationId: null, guideId }
}

function parseReviewBody(body: ReviewBody) {
  const targetType  = body.target_type as ReviewTargetType | undefined
  const itineraryId = typeof body.itinerary_id === 'string' ? body.itinerary_id : null
  const locationId  = typeof body.location_id  === 'string' ? body.location_id  : null
  const guideId     = typeof body.guide_id      === 'string' ? body.guide_id      : null
  const rating      = Number(body.rating)
  const reviewText  = typeof body.body === 'string' ? body.body.trim() : ''

  if (!targetType || !TARGET_TYPES.has(targetType))
    return { error: 'Invalid target_type' }

  if (targetType === 'itinerary' && (!itineraryId || !UUID_REGEX.test(itineraryId) || locationId || guideId))
    return { error: 'A valid itinerary_id is required for itinerary reviews' }

  if (targetType === 'location' && (!locationId || !UUID_REGEX.test(locationId) || itineraryId || guideId))
    return { error: 'A valid location_id is required for location reviews' }

  if (targetType === 'guide' && (!guideId || !UUID_REGEX.test(guideId) || itineraryId || locationId))
    return { error: 'A valid guide_id is required for guide reviews' }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    return { error: 'Rating must be an integer between 1 and 5' }

  if (reviewText.length < 3 || reviewText.length > 1200)
    return { error: 'Review text must be between 3 and 1200 characters' }

  return { targetType, itineraryId, locationId, guideId, rating, reviewText }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const target = parseTarget(searchParams)
  if ('error' in target) {
    return NextResponse.json({ error: target.error }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let query = supabase
    .from('reviews')
    .select('*')
    .eq('target_type', target.targetType)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (target.targetType === 'itinerary') query = query.eq('itinerary_id', target.itineraryId)
  else if (target.targetType === 'location') query = query.eq('location_id', target.locationId)
  else query = query.eq('guide_id', target.guideId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const reviews = (data || []).map(r => ({ ...r, is_own: Boolean(user && r.user_id === user.id) }))
  const reviewCount   = reviews.length
  const averageRating = reviewCount > 0
    ? Number((reviews.reduce((s, r) => s + r.rating, 0) / reviewCount).toFixed(1))
    : null
  const viewerReviewId = reviews.find(r => r.is_own)?.id ?? null

  return NextResponse.json({ reviews, averageRating, reviewCount, viewerReviewId })
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = parseReviewBody(await request.json() as ReviewBody)
    if ('error' in payload) return NextResponse.json({ error: payload.error }, { status: 400 })

    // Guide reviews require a completed booking with that guide
    if (payload.targetType === 'guide') {
      const { data: booking } = await supabase
        .from('guide_bookings')
        .select('id')
        .eq('traveler_id', user.id)
        .eq('guide_id', payload.guideId!)
        .eq('status', 'completed')
        .limit(1)
        .maybeSingle()

      if (!booking) {
        return NextResponse.json(
          { error: 'You can only review a guide after completing a booking with them.' },
          { status: 403 }
        )
      }
    }

    // Check for existing review (upsert)
    let existingQuery = supabase
      .from('reviews')
      .select('id')
      .eq('user_id', user.id)
      .eq('target_type', payload.targetType)

    if (payload.targetType === 'itinerary') existingQuery = existingQuery.eq('itinerary_id', payload.itineraryId!)
    else if (payload.targetType === 'location') existingQuery = existingQuery.eq('location_id', payload.locationId!)
    else existingQuery = existingQuery.eq('guide_id', payload.guideId!)

    const { data: existing } = await existingQuery.maybeSingle()

    const reviewData = {
      user_id:      user.id,
      target_type:  payload.targetType,
      itinerary_id: payload.itineraryId,
      location_id:  payload.locationId,
      guide_id:     payload.guideId,
      rating:       payload.rating,
      body:         payload.reviewText,
      status:       'published',
    }

    const query = existing
      ? supabase.from('reviews').update(reviewData).eq('id', existing.id).eq('user_id', user.id).select().single()
      : supabase.from('reviews').insert(reviewData).select().single()

    const { data: review, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json(review, { status: existing ? 200 : 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
