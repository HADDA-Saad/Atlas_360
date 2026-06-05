import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface UpdateGuideBody {
  bio?: string | null
  languages?: string[]
  regions?: string[]
  daily_rate_mad?: number
  whatsapp_number?: string | null
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
    if ('whatsapp_number' in body) updateObj.whatsapp_number = body.whatsapp_number

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
