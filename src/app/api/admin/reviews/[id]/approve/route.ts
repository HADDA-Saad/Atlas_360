import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdmin } from '@/lib/auth/roles'

interface PatchBody {
  photo_approved?: unknown
  clear_photos?: unknown
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !await isAdmin()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json() as PatchBody

    const updateObj: Record<string, any> = {}

    if ('photo_approved' in body) {
      if (typeof body.photo_approved !== 'boolean') {
        return NextResponse.json({ error: 'photo_approved must be a boolean' }, { status: 400 })
      }
      updateObj.photo_approved = body.photo_approved
    }

    if ('clear_photos' in body && body.clear_photos === true) {
      updateObj.photo_urls = []
      updateObj.photo_approved = false
    }

    if (Object.keys(updateObj).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { data, error } = await createAdminClient()
      .from('reviews')
      .update(updateObj)
      .eq('id', id)
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
