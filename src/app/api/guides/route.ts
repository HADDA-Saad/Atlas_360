import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { notifyAdmins } from '@/lib/notifications'

const ADMIN_EMAILS = ['jaz.ouchene@gmail.com', 'jazoulizaka@gmail.com', 'jazoulizka@gmail.com', 'saadhad08@gmail.com']

interface CreateGuideBody {
  bio?: string | null
  languages?: string[]
  regions?: string[]
  daily_rate_mad?: number
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json() as CreateGuideBody

    const { data: existing } = await supabase
      .from('guides')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Guide profile already exists' }, { status: 409 })
    }

    const { data, error } = await supabase
      .from('guides')
      .insert({
        id: user.id,
        bio: body.bio ?? null,
        languages: body.languages ?? [],
        regions: body.regions ?? [],
        daily_rate_mad: body.daily_rate_mad ?? 0,
        is_verified: false,
      })
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Notify admins that a new guide is awaiting review
    await notifyAdmins(ADMIN_EMAILS, {
      type: 'guide_pending_review',
      title: 'New guide awaiting verification',
      body: `${user.email} has registered as a guide and is waiting for your review.`,
      link: '/dashboard/requests?tab=guides',
    })

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

interface UpdateGuideBody {
  bio?: string | null
  languages?: string[]
  regions?: string[]
  daily_rate_mad?: number
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as UpdateGuideBody
    const updateObj: Record<string, any> = {}

    if ('bio' in body) updateObj.bio = body.bio
    if ('languages' in body) {
      if (!Array.isArray(body.languages)) {
        return NextResponse.json({ error: 'Languages must be an array' }, { status: 400 })
      }
      updateObj.languages = body.languages
    }
    if ('regions' in body) {
      if (!Array.isArray(body.regions)) {
        return NextResponse.json({ error: 'Regions must be an array' }, { status: 400 })
      }
      updateObj.regions = body.regions
    }
    if ('daily_rate_mad' in body) {
      if (typeof body.daily_rate_mad !== 'number' || body.daily_rate_mad < 0) {
        return NextResponse.json({ error: 'Daily rate must be a non-negative number' }, { status: 400 })
      }
      updateObj.daily_rate_mad = body.daily_rate_mad
    }
    if (Object.keys(updateObj).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('guides')
      .update(updateObj)
      .eq('id', user.id)
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
