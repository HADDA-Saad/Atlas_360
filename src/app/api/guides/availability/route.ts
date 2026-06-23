import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface BlockDateBody {
  blocked_date?: string
  reason?: string | null
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a guide
    const { data: guide } = await supabase
      .from('guides')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!guide) {
      return NextResponse.json({ error: 'Not a guide' }, { status: 403 })
    }

    const body = await request.json() as BlockDateBody

    if (!body.blocked_date || !/^\d{4}-\d{2}-\d{2}$/.test(body.blocked_date)) {
      return NextResponse.json({ error: 'Invalid blocked_date. Must be YYYY-MM-DD' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('guide_availability')
      .insert({
        guide_id: user.id,
        blocked_date: body.blocked_date,
        reason: body.reason || null
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Availability id is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('guide_availability')
      .delete()
      .eq('id', id)
      .eq('guide_id', user.id) // Protect deletion

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
