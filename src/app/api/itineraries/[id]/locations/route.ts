import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// UUID v4 regex pattern for validation
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Validate UUID format
    if (!UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: 'Invalid itinerary ID format. Must be a valid UUID.' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: locations, error } = await supabase
      .from('locations')
      .select('*')
      .eq('itinerary_id', id)
      .order('order_index', { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(locations)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
