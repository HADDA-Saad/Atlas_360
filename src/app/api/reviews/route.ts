import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ReviewTargetType } from '@/types'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const TARGET_TYPES = new Set<ReviewTargetType>(['itinerary', 'location'])

interface ReviewBody {
  target_type?: unknown
  itinerary_id?: unknown
  location_id?: unknown
  rating?: unknown
  body?: unknown
}

function parseTarget(searchParams: URLSearchParams) {
  const targetType = searchParams.get('target_type') as ReviewTargetType | null
  const itineraryId = searchParams.get('itinerary_id')
  const locationId = searchParams.get('location_id')

  if (!targetType || !TARGET_TYPES.has(targetType)) {
    return { error: 'Invalid target_type: must be itinerary or location' }
  }

  if (targetType === 'itinerary') {
    if (!itineraryId || !UUID_REGEX.test(itineraryId) || locationId) {
      return { error: 'A valid itinerary_id is required for itinerary reviews' }
    }
    return { targetType, itineraryId, locationId: null }
  }

  if (!locationId || !UUID_REGEX.test(locationId) || itineraryId) {
    return { error: 'A valid location_id is required for location reviews' }
  }
  return { targetType, itineraryId: null, locationId }
}

function parseReviewBody(body: ReviewBody) {
  const targetType = body.target_type as ReviewTargetType | undefined
  const itineraryId = typeof body.itinerary_id === 'string' ? body.itinerary_id : null
  const locationId = typeof body.location_id === 'string' ? body.location_id : null
  const rating = Number(body.rating)
  const reviewText = typeof body.body === 'string' ? body.body.trim() : ''

  if (!targetType || !TARGET_TYPES.has(targetType)) {
    return { error: 'Invalid target_type: must be itinerary or location' }
  }

  if (targetType === 'itinerary' && (!itineraryId || !UUID_REGEX.test(itineraryId) || locationId)) {
    return { error: 'A valid itinerary_id is required for itinerary reviews' }
  }

  if (targetType === 'location' && (!locationId || !UUID_REGEX.test(locationId) || itineraryId)) {
    return { error: 'A valid location_id is required for location reviews' }
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: 'Rating must be an integer between 1 and 5' }
  }

  if (reviewText.length < 3 || reviewText.length > 1200) {
    return { error: 'Review text must be between 3 and 1200 characters' }
  }

  return { targetType, itineraryId, locationId, rating, reviewText }
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

  query = target.targetType === 'itinerary'
    ? query.eq('itinerary_id', target.itineraryId)
    : query.eq('location_id', target.locationId)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const reviews = (data || []).map((review) => ({
    ...review,
    is_own: Boolean(user && review.user_id === user.id),
  }))

  const reviewCount = reviews.length
  const averageRating = reviewCount > 0
    ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount).toFixed(1))
    : null
  const viewerReviewId = reviews.find((review) => review.is_own)?.id || null

  return NextResponse.json({ reviews, averageRating, reviewCount, viewerReviewId })
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = parseReviewBody(await request.json() as ReviewBody)
    if ('error' in payload) {
      return NextResponse.json({ error: payload.error }, { status: 400 })
    }

    let existingQuery = supabase
      .from('reviews')
      .select('id')
      .eq('user_id', user.id)
      .eq('target_type', payload.targetType)

    existingQuery = payload.targetType === 'itinerary'
      ? existingQuery.eq('itinerary_id', payload.itineraryId)
      : existingQuery.eq('location_id', payload.locationId)

    const { data: existing, error: existingError } = await existingQuery.maybeSingle()
    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 500 })
    }

    const reviewData = {
      user_id: user.id,
      target_type: payload.targetType,
      itinerary_id: payload.itineraryId,
      location_id: payload.locationId,
      rating: payload.rating,
      body: payload.reviewText,
      status: 'published',
    }

    const query = existing
      ? supabase.from('reviews').update(reviewData).eq('id', existing.id).eq('user_id', user.id).select().single()
      : supabase.from('reviews').insert(reviewData).select().single()

    const { data: review, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(review, { status: existing ? 200 : 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
