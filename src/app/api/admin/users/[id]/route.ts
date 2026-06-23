import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const VALID_ROLES = new Set(['member', 'moderator', 'admin'])
const VALID_TIERS = new Set(['explorer', 'nomad', 'elite'])

interface PatchBody {
  role?: unknown
  tier?: unknown
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify requesting user is an administrator via the database role
    const { data: requestorProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!requestorProfile || requestorProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json() as PatchBody

    const updateObj: Record<string, unknown> = {}

    // Validate role update
    if ('role' in body) {
      if (typeof body.role !== 'string' || !VALID_ROLES.has(body.role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
      }
      updateObj.role = body.role
    }

    // Validate tier update
    if ('tier' in body) {
      if (typeof body.tier !== 'string' || !VALID_TIERS.has(body.tier)) {
        return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
      }
      updateObj.tier = body.tier
    }



    if (Object.keys(updateObj).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    // Perform database update using admin client to bypass policies
    const { data, error } = await createAdminClient()
      .from('profiles')
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
