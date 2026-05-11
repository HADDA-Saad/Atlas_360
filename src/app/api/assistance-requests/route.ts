import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { PlaceType } from '@/types'

const REQUEST_TYPES = new Set(['planning', 'booking_help'])
const PLACE_TYPES = new Set<PlaceType>(['lodging', 'restaurant'])
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface AssistanceRequestBody {
  request_type?: unknown
  contact_name?: unknown
  contact_email?: unknown
  message?: unknown
  itinerary_id?: unknown
  place_id?: unknown
  place_name?: unknown
  place_type?: unknown
  source_path?: unknown
}

function parseBody(body: AssistanceRequestBody) {
  const requestType = typeof body.request_type === 'string' ? body.request_type : ''
  const contactName = typeof body.contact_name === 'string' ? body.contact_name.trim() : null
  const contactEmail = typeof body.contact_email === 'string' ? body.contact_email.trim().toLowerCase() : ''
  const message = typeof body.message === 'string' ? body.message.trim() : ''
  const itineraryId = typeof body.itinerary_id === 'string' && UUID_REGEX.test(body.itinerary_id)
    ? body.itinerary_id
    : null
  const placeId = typeof body.place_id === 'string' ? body.place_id.trim() : null
  const placeName = typeof body.place_name === 'string' ? body.place_name.trim() : null
  const placeType = typeof body.place_type === 'string' && PLACE_TYPES.has(body.place_type as PlaceType)
    ? body.place_type
    : null
  const sourcePath = typeof body.source_path === 'string' ? body.source_path.slice(0, 500) : null

  if (!REQUEST_TYPES.has(requestType)) {
    return { error: 'Invalid request type' }
  }

  if (!EMAIL_REGEX.test(contactEmail)) {
    return { error: 'A valid email is required' }
  }

  if (message.length < 10 || message.length > 2000) {
    return { error: 'Message must be between 10 and 2000 characters' }
  }

  if (requestType === 'booking_help' && (!placeId || !placeName || !placeType)) {
    return { error: 'Booking help requires a valid hotel or restaurant' }
  }

  return {
    requestType,
    contactName,
    contactEmail,
    message,
    itineraryId,
    placeId,
    placeName,
    placeType,
    sourcePath,
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const payload = parseBody(await request.json() as AssistanceRequestBody)

    if ('error' in payload) {
      return NextResponse.json({ error: payload.error }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('assistance_requests')
      .insert({
        user_id: user?.id || null,
        request_type: payload.requestType,
        contact_name: payload.contactName,
        contact_email: payload.contactEmail,
        message: payload.message,
        itinerary_id: payload.itineraryId,
        place_id: payload.placeId,
        place_name: payload.placeName,
        place_type: payload.placeType,
        source_path: payload.sourcePath,
        status: 'new',
      })
      .select('id, status')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
