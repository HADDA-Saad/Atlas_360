import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface UpdateUserItineraryBody {
  is_public?: unknown
  title?: unknown
}

interface UpdateUserItineraryData {
  is_public?: boolean
  title?: string
}

interface StopInput {
  location_id: string
  day_number: number
  order_index: number
  custom_notes?: string
}

interface SaveUserItineraryBody {
  title?: unknown
  description?: unknown
  stops?: unknown
}

function isStopInput(stop: unknown): stop is StopInput {
  if (!stop || typeof stop !== 'object') return false

  const candidate = stop as Record<string, unknown>
  return (
    typeof candidate.location_id === 'string' &&
    Number.isInteger(candidate.day_number) &&
    Number.isInteger(candidate.order_index) &&
    (
      candidate.custom_notes === undefined ||
      candidate.custom_notes === null ||
      typeof candidate.custom_notes === 'string'
    )
  )
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as UpdateUserItineraryBody
    const { is_public, title } = body

    const updateData: UpdateUserItineraryData = {}
    if (typeof is_public === 'boolean') updateData.is_public = is_public
    if (typeof title === 'string') updateData.title = title

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { data: itinerary, error } = await supabase
      .from('user_itineraries')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating itinerary:', error)
      return NextResponse.json({ error: 'Failed to update itinerary or not found' }, { status: 500 })
    }

    return NextResponse.json(itinerary)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as SaveUserItineraryBody
    const { title, description, stops } = body

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    if (!Array.isArray(stops) || stops.length === 0 || !stops.every(isStopInput)) {
      return NextResponse.json({ error: 'At least one valid stop is required' }, { status: 400 })
    }

    const { data: itinerary, error } = await supabase
      .rpc('update_user_itinerary_with_stops', {
        p_itinerary_id: id,
        p_user_id: user.id,
        p_title: title,
        p_description: typeof description === 'string' ? description : '',
        p_stops: stops,
      })
      .single()

    if (error) {
      console.error('Error updating itinerary:', error)
      return NextResponse.json({ error: 'Failed to update itinerary or not found' }, { status: 500 })
    }

    return NextResponse.json(itinerary)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('user_itineraries')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting itinerary:', error)
      return NextResponse.json({ error: 'Failed to delete itinerary' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
