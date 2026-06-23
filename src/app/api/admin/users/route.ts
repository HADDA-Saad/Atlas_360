import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const searchQuery = searchParams.get('search')?.toLowerCase() || ''

    const adminSupabase = createAdminClient()

    // Fetch auth users to retrieve their email addresses
    const { data: authData, error: authError } = await adminSupabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    // Fetch database profiles
    const { data: profiles, error: dbError } = await adminSupabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    // Merge auth emails and profiles
    const users = (profiles || []).map(p => {
      const authUser = authData.users.find(u => u.id === p.id)
      return {
        id: p.id,
        full_name: p.full_name || 'Unnamed User',
        email: authUser?.email || 'Unknown email',
        tier: p.tier,
        role: p.role,
        subscription_status: p.subscription_status || 'none',
        created_at: p.created_at
      }
    })

    // Filter by search query if provided
    const filteredUsers = searchQuery
      ? users.filter(u => 
          u.email.toLowerCase().includes(searchQuery) || 
          u.full_name.toLowerCase().includes(searchQuery)
        )
      : users

    return NextResponse.json(filteredUsers)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
