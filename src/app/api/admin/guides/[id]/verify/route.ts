import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createNotification } from '@/lib/notifications'

const ADMIN_EMAILS = ['jaz.ouchene@gmail.com', 'jazoulizaka@gmail.com', 'jazoulizka@gmail.com', 'saadhad08@gmail.com']

interface PatchBody {
  is_verified?: unknown
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json() as PatchBody

    if (typeof body.is_verified !== 'boolean') {
      return NextResponse.json({ error: 'is_verified must be a boolean' }, { status: 400 })
    }

    const { data, error } = await createAdminClient()
      .from('guides')
      .update({ is_verified: body.is_verified })
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Notify the guide when their profile is verified
    if (body.is_verified) {
      await createNotification({
        user_id: id,
        type: 'guide_verified',
        title: "You're verified!",
        body: 'Your guide profile is now live. Travelers can discover and book you.',
        link: '/dashboard/guide',
      })
    }

    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
