import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/auth/roles'

const VALID_STATUSES = new Set(['new', 'in_progress', 'completed', 'closed'])

interface PatchBody {
  status?: unknown
  assigned_team_member?: unknown
  internal_notes?: unknown
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

    if ('status' in body) {
      if (typeof body.status !== 'string' || !VALID_STATUSES.has(body.status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }
      updateObj.status = body.status
    }

    if ('assigned_team_member' in body) {
      if (body.assigned_team_member !== null && typeof body.assigned_team_member !== 'string') {
        return NextResponse.json({ error: 'Invalid assigned team member' }, { status: 400 })
      }
      updateObj.assigned_team_member = body.assigned_team_member
    }

    if ('internal_notes' in body) {
      if (body.internal_notes !== null && typeof body.internal_notes !== 'string') {
        return NextResponse.json({ error: 'Invalid internal notes' }, { status: 400 })
      }
      updateObj.internal_notes = body.internal_notes
    }

    if (Object.keys(updateObj).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('assistance_requests')
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
