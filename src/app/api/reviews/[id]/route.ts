import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface UpdateReviewBody {
  rating?: unknown
  body?: unknown
}

function parseUpdateBody(body: UpdateReviewBody) {
  const rating = body.rating === undefined ? undefined : Number(body.rating)
  const reviewText = body.body === undefined
    ? undefined
    : typeof body.body === 'string'
      ? body.body.trim()
      : ''

  if (rating !== undefined && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
    return { error: 'Rating must be an integer between 1 and 5' }
  }

  if (reviewText !== undefined && (reviewText.length < 3 || reviewText.length > 1200)) {
    return { error: 'Review text must be between 3 and 1200 characters' }
  }

  const updateData: { rating?: number, body?: string } = {}
  if (rating !== undefined) updateData.rating = rating
  if (reviewText !== undefined) updateData.body = reviewText

  if (Object.keys(updateData).length === 0) {
    return { error: 'No fields to update' }
  }

  return { updateData }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!UUID_REGEX.test(id)) {
      return NextResponse.json({ error: 'Invalid review ID format' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = parseUpdateBody(await request.json() as UpdateReviewBody)
    if ('error' in payload) {
      return NextResponse.json({ error: payload.error }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('reviews')
      .update(payload.updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to update review or not found' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!UUID_REGEX.test(id)) {
      return NextResponse.json({ error: 'Invalid review ID format' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: 'Failed to delete review or not found' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
